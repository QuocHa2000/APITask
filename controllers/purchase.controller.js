const userModel = require('../models/user.model');
const productModel = require('../models/product.model');
const orderModel = require('../models/order.model');
const { validateInput } = require('../utils/validateinput');
const { checkGetOrder, sellerChangeStatusOfOrder, userChangeStatusOfOrder } = require('../validate/order.validate');
const { db } = require('../models/order.model');
const { orderStatus } = require('../utils/orderstatus');

module.exports.purchaseProduct = async function(req, res) {
    try {
        const cart = req.user.cart;
        if (cart.length === 0) {
            throw { message: 'Your cart is empty' };
        }
        let listOfOrders = [];

        for (productInCart of cart) {
            if (productInCart.pick == true) {
                const product = await productModel.findOne({ _id: productInCart.productId });
                if (!product) {
                    throw { message: `Product : ${productInCart.productId} doesn\'t exists, please remove it in your cart and repurchase` }
                };
                if (product.quantity < productInCart.amount) {
                    throw { message: 'Amount of product you purchase is greater than amount of available products' };
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
                        status: orderStatus.confirm
                    })
                }
            }
        }

        const result = await orderModel.insertMany(listOfOrders);
        for (item of listOfOrders) {
            for (detail of item.products) {
                await userModel.findOneAndUpdate({ _id: req.user._id }, { $pull: { cart: { productId: detail.product._id } } });
                await productModel.findOneAndUpdate({ _id: detail.product._id }, { $inc: { quantity: -(detail.amount), sold: detail.amount } });
            }
        }
        res.json({
            code: 0,
            message: "Purchase product successfully",
            data: result
        })
    } catch (error) {
        res.json({
            code: 1,
            message: error.message,
            data: "Error"
        });
    }
}
module.exports.sellerChangeOrderStatus = async function(req, res) {
    try {
        const session = await db.startSession();
        session.startTransaction();

        const validateError = validateInput(req.body, sellerChangeStatusOfOrder);
        if (validateError) {
            throw validateError;
        }
        let queryConditions = {};
        const status = req.body.status;
        if (status === orderStatus.pickup) {
            queryConditions = {
                _id: req.body.orderId,
                seller: req.user._id,
                status: orderStatus.pickup
            }
        } else {
            queryConditions = {
                _id: req.body.orderId,
                seller: req.user._id,
                status: orderStatus.confirm
            }
        }
        const order = await orderModel.findOne(queryConditions);
        if (!order) {
            throw { message: 'Order doesn\'t exists' };
        }

        if (status === orderStatus.confirm) {
            await orderModel.findOneAndUpdate({ _id: req.body.orderId }, { status: orderStatus.pickup });
        } else if (status === orderStatus.pickup) {
            await orderModel.findOneAndUpdate({ _id: req.body.orderId }, { status: orderStatus.shipping })
        } else {
            let changeStatus = await orderModel.findOneAndUpdate({ _id: req.body.orderId }, { status: orderStatus.cancel }, { session: session });
            for (detail of order.products) {
                let changeQuantity = await productModel.findOneAndUpdate({ _id: detail.product._id }, { $inc: { quantity: (order.amount), sold: -(order.amount) } }, { session: session });
                await session.commitTransaction();
                if (changeStatus.modifiedCount == 0 || changeQuantity.modifiedCount == 0) {
                    await session.abortTransaction();
                }
            }
        }
        session.endSession();
        const result = await orderModel.findOne({ _id: req.body.orderId });
        res.json({
            code: 0,
            message: 'Change order status successfully',
            data: result
        })
    } catch (error) {
        res.json({
            code: 1,
            message: error.message,
            data: 'Error'
        })
    }
}

module.exports.buyerChangeOrderStatus = async function(req, res) {
    try {
        const session = await db.startSession();
        session.startTransaction();

        const validateError = validateInput(req.body, userChangeStatusOfOrder);
        if (validateError) {
            throw validateError;
        }

        let queryConditions;
        if (req.body.status === orderStatus.finish) {
            queryConditions = {
                _id: req.body.orderId,
                buyer: req.user._id,
                status: orderStatus.shipping
            }
        } else {
            queryConditions = {
                _id: req.body.orderId,
                buyer: req.user._id,
                status: orderStatus.confirm
            }
        }

        const order = await orderModel.findOne(queryConditions);
        if (!order) {
            throw { message: 'Order doesn\'t exists' };
        }

        const status = req.body.status;
        if (status === orderStatus.finish) {
            await orderModel.findOneAndUpdate({ _id: req.body.orderId }, { status: orderStatus.finish });
        } else {
            let changeStatus = await orderModel.findOneAndUpdate({ _id: req.body.orderId }, { status: orderStatus.cancel }, { session: session });
            for (detail of order.products) {
                let changeQuantity = await productModel.findOneAndUpdate({ _id: detail.product._id }, { $inc: { quantity: (detail.amount), sold: -(detail.amount) } }, { session: session });
                await session.commitTransaction();
                if (changeStatus.modifiedCount == 0 || changeQuantity.modifiedCount == 0) {
                    await session.abortTransaction();
                }
            }
        }
        const result = await orderModel.findOne({ _id: req.body.orderId });
        session.endSession();

        res.json({
            code: 0,
            message: 'Change order status successfully',
            data: result
        })
    } catch (error) {
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
        let queryConditions = {};

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