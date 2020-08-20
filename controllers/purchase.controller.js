const userModel = require('../models/user.model');
const productModel = require('../models/product.model');
const orderModel = require('../models/order.model');
const { validateInput } = require('../utils/validateinput');
const { checkGetOrder, sellerChangeStatusOfOrder, buyerChangeStatusOfOrder } = require('../validate/order.validate');
const { db } = require('../models/order.model');
const { orderStatus } = require('../utils/orderstatus');

module.exports.purchaseProduct = async function(req, res) {
    const session = await db.startSession();
    session.startTransaction();
    try {
        const cart = req.user.cart;
        if (cart.length === 0) {
            throw { message: 'Your cart is empty' };
        }
        let listOfOrders = [];

        for (const productInCart of cart) {
            if (productInCart.pick === true) {
                const product = await productModel.findById(productInCart.productId);
                if (!product) {
                    throw { message: `Product : ${productInCart.productId} doesn\'t exists, please remove it in your cart and repurchase` };
                };
                if (product.quantity < productInCart.amount) {
                    throw { message: 'Amount of product you purchase is greater than the number of available products' };
                };
                let sameSellerOrder = listOfOrders.find(item => product.owner.equals(item.seller));
                const addedProduct = {
                    product: product,
                    amount: productInCart.amount,
                    totalPriceOfProduct: product.salePrice * productInCart.amount
                }
                if (sameSellerOrder) {
                    sameSellerOrder.products.push(addedProduct);
                } else {
                    listOfOrders.push({
                        products: [addedProduct],
                        buyer: req.user._id,
                        seller: product.owner,
                        status: orderStatus.pending
                    })
                }
            }
        }

        for (const item of listOfOrders) {
            for (const detail of item.products) {
                await userModel.updateOne({ _id: req.user._id }, { $pull: { cart: { productId: detail.product._id } } }, { session: session });
                await productModel.updateOne({ _id: detail.product._id }, { $inc: { quantity: -(detail.amount), sold: detail.amount } }, { session: session });
            }
        }
        const result = await orderModel.insertMany(listOfOrders, { session: session });
        await session.commitTransaction();
        session.endSession();
        res.json({
            code: 0,
            message: "Purchase product successfully",
            data: result
        })
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.json({
            code: 1,
            message: error.message,
            data: "Error"
        });
    }
}
module.exports.sellerChangeOrderStatus = async function(req, res) {
    const session = await db.startSession();
    session.startTransaction();
    try {
        const validateError = validateInput(req.body, sellerChangeStatusOfOrder);
        if (validateError) {
            throw validateError;
        }
        let queryConditions = {};
        const status = req.body.status;
        if (status === orderStatus.shipping) {
            queryConditions = {
                _id: req.body.orderId,
                seller: req.user._id,
                status: orderStatus.ready
            }
        } else {
            queryConditions = {
                _id: req.body.orderId,
                seller: req.user._id,
                status: orderStatus.pending
            }
        }
        const order = await orderModel.findOne(queryConditions);
        if (!order) {
            throw { message: 'Order doesn\'t exists' };
        }
        let result;
        if (status === orderStatus.ready) {
            result = await orderModel.findByIdAndUpdate(req.body.orderId, { status: orderStatus.ready }, { new: true });
        } else if (status === orderStatus.shipping) {
            result = await orderModel.findByIdAndUpdate(req.body.orderId, { status: orderStatus.shipping }, { new: true });
        } else {
            result = await orderModel.findByIdAndUpdate(req.body.orderId, { status: orderStatus.canceled }, { session: session, new: true });
            for (const detail of order.products) {
                await productModel.updateOne({ _id: detail.product._id }, { $inc: { quantity: (detail.amount), sold: -(detail.amount) } }, { session: session });
            }
        }
        await session.commitTransaction();
        session.endSession();
        res.json({
            code: 0,
            message: 'Change order status successfully',
            data: result
        })
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.json({
            code: 1,
            message: error.message,
            data: 'Error'
        })
    }
}

module.exports.buyerChangeOrderStatus = async function(req, res) {
    const session = await db.startSession();
    session.startTransaction();
    try {
        const validateError = validateInput(req.body, buyerChangeStatusOfOrder);
        if (validateError) {
            throw validateError;
        }

        let queryConditions;
        const status = req.body.status;
        if (status === orderStatus.finished) {
            queryConditions = {
                _id: req.body.orderId,
                buyer: req.user._id,
                status: orderStatus.shipping
            }
        } else {
            queryConditions = {
                _id: req.body.orderId,
                buyer: req.user._id,
                status: orderStatus.pending
            }
        }

        const order = await orderModel.findOne(queryConditions);
        if (!order) {
            throw { message: 'Order doesn\'t exists' };
        }

        let result;
        if (status === orderStatus.finished) {
            result = await orderModel.findByIdAndUpdate(req.body.orderId, { status: orderStatus.finished }, { new: true });
        } else {
            result = await orderModel.findByIdAndUpdate(req.body.orderId, { status: orderStatus.canceled }, { session: session, new: true });
            for (const detail of order.products) {
                await productModel.updateOne({ _id: detail.product._id }, { $inc: { quantity: (detail.amount), sold: -(detail.amount) } }, { session: session });
            }
        }
        await session.commitTransaction();
        session.endSession();
        res.json({
            code: 0,
            message: 'Change order status successfully',
            data: result
        })
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.json({
            code: 1,
            message: error.message,
            data: 'Error'
        })
    }

}

module.exports.getMyOrder = async function(req, res) {
    try {
        const validateError = validateInput(req.body, checkGetOrder);
        if (validateError) {
            throw validateError;
        }
        const page = req.query.page || 1;
        const perPage = 12;
        let skip = (page - 1) * perPage;

        const role = req.body.role;
        let queryConditions;
        if (req.body.status === 'all') {
            queryConditions = {
                [role]: req.user._id
            };
        } else {
            queryConditions = {
                [role]: req.user._id,
                status: req.body.status
            }
        }
        const result = await orderModel.find(queryConditions)
            .populate({ path: 'buyer', select: { email: 1, phone: 1, name: 1 } })
            .populate({ path: 'seller', select: { email: 1 } })
            .limit(perPage)
            .skip(skip);
        res.json({
            code: 1,
            message: 'Get my orders successfully',
            data: result,
            totalPage: Math.ceil(result.length / perPage)
        })
    } catch (error) {
        res.json({
            code: 1,
            message: error.message,
            data: 'Error'
        })
    }
}