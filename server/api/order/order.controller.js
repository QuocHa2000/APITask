const { db } = require('./order.model');
const orderStatus = require('../../utils/order-status');
const errorMessage = require('../../utils/error-message');
const orderService = require('./order.service');
const productService = require('../product/product.service');
const userService = require('../user/user.service');

module.exports.purchaseProduct = async function(req, res) {
    const session = await db.startSession();
    session.startTransaction();
    try {
        const cart = req.user.cart;
        let listOfOrders = [];
        for (const productInCart of cart) {
            if (productInCart.pick === true) {
                const product = await productService.getById(productInCart.productId);
                if (!product) {
                    throw new Error(`Product : ${productInCart.productId} doesn't exists, please remove it in your cart and repurchase`);
                }
                if (product.quantity < productInCart.amount) {
                    throw new Error(errorMessage.TOO_MUCH_PRODUCT);
                }
                let sameSellerOrder = listOfOrders.find((item) => product.owner.equals(item.seller));
                const addedProduct = {
                    product: product,
                    amount: productInCart.amount,
                    totalPriceOfProduct: product.salePrice * productInCart.amount,
                };
                if (sameSellerOrder) {
                    sameSellerOrder.products.push(addedProduct);
                    sameSellerOrder.totalCost += addedProduct.totalPriceOfProduct;
                } else {
                    listOfOrders.push({
                        products: [addedProduct],
                        buyer: req.user._id,
                        seller: product.owner,
                        status: orderStatus.PENDING,
                        totalCost: addedProduct.totalPriceOfProduct,
                    });
                }
            }
        }

        for (const item of listOfOrders) {
            for (const detail of item.products) {
                await userService.updateById(req.user._id, { $pull: { cart: { productId: detail.product._id } } }, { session: session });
                await productService.updateById(detail.product._id, { $inc: { quantity: -detail.amount, sold: detail.amount } }, { session: session });
            }
        }
        const result = await orderService.insertMany(listOfOrders, { session: session });
        await session.commitTransaction();
        session.endSession();
        res.json({
            code: 0,
            message: 'Purchase product successfully',
            data: result,
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.json({
            code: 1,
            message: error.message,
            data: 'Error',
        });
    }
};
module.exports.sellerChangeOrderStatus = async function(req, res) {
    const session = await db.startSession();
    session.startTransaction();
    try {
        let result;
        const status = req.body.status;
        if (status === orderStatus.READY) {
            result = await orderService.updateById(
                req.body.orderId, { status: orderStatus.READY }
            );
        } else if (status === orderStatus.SHIPPING) {
            result = await orderService.updateById(
                req.body.orderId, { status: orderStatus.SHIPPING }
            );
        } else {
            result = await orderService.updateById(
                req.body.orderId, { status: orderStatus.CANCELED }, { session: session }
            );
            for (const detail of order.products) {
                await productService.updateOne({ _id: detail.product._id }, { $inc: { quantity: detail.amount, sold: -detail.amount } }, { session: session });
            }
        }
        await session.commitTransaction();
        session.endSession();
        res.json({
            code: 0,
            message: 'Change order status successfully',
            data: result,
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.json({
            code: 1,
            message: error.message,
            data: 'Error',
        });
    }
};

module.exports.buyerChangeOrderStatus = async function(req, res) {
    const session = await db.startSession();
    session.startTransaction();
    try {
        let result;
        const status = req.body.status;
        if (status === orderStatus.FINISHED) {
            result = await orderService.updateById(
                req.body.orderId, { status: orderStatus.FINISHED }
            );
        } else {
            result = await orderService.updateById(
                req.body.orderId, { status: orderStatus.CANCELED }, { session: session }
            );
            for (const detail of order.products) {
                await productService.updateOne({ _id: detail.product._id }, { $inc: { quantity: detail.amount, sold: -detail.amount } }, { session: session });
            }
        }
        await session.commitTransaction();
        session.endSession();
        res.json({
            code: 0,
            message: 'Change order status successfully',
            data: result,
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.json({
            code: 1,
            message: error.message,
            data: 'Error',
        });
    }
};

module.exports.getMyOrder = async function(req, res) {
    try {
        const page = req.query.page || 1;
        const perPage = 10;
        const role = req.body.role;
        let queryConditions;
        if (req.body.status === 'all') {
            queryConditions = {
                [role]: req.user._id,
            };
        } else {
            queryConditions = {
                [role]: req.user._id,
                status: req.body.status,
            };
        }
        const result = await orderService.populate({
            query: queryConditions,
            populate: [{
                path: 'buyer',
                select: { email: 1, phone: 1, name: 1 },
            }, { path: 'seller', select: { email: 1 } }],
            page: page,
            perPage: perPage
        })
        res.json({
            code: 1,
            message: 'Get my orders successfully',
            data: result,
            totalPage: Math.ceil(result.length / perPage),
        });
    } catch (error) {
        res.json({
            code: 1,
            message: error.message,
            data: 'Error',
        });
    }
};