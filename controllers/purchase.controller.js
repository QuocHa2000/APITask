const userModel = require('../models/user.model');
const productModel = require('../models/product.model');
const orderModel = require('../models/order.model');
const { validateInput } = require('../utils/joival');
const { checkGetOrder, sellerChangeStatusOfOrder, userChangeStatusOfOrder } = require('../validate/order.validate');
const { db } = require('../models/order.model');
const { orderStatus } = require('../utils/orderstatus');

module.exports.purchaseProduct = async function(req, res) {
    try {
        const cart = req.user.cart;
        if (cart.length === 0) throw { message: 'Cart is empty' };
        let listOfOrders = [];
        for (product of cart) {
            if (product.pick == true) {
                let foundProduct = await productModel.findOne({ _id: product.productDetail });
                if (!foundProduct) { throw { message: `Product : ${item} doesn\'t exists, please remove it in your cart and repurchase` } };
                const sameShopOrder = listOfOrders.find(item => foundProduct.owner.equals(item.seller));
                if (sameShopOrder) sameShopOrder.products.push({ product: foundProduct, amount: product.amount });
                else listOfOrders.push({
                    products: [{ product: foundProduct, amount: product.amount }],
                    buyer: req.user._id,
                    seller: foundProduct.owner,
                    status: orderStatus.confirm
                })
            }
        }
        const result = await orderModel.insertMany(listOfOrders);
        for (item of listOfOrders) {
            for (product of item.products) {
                await userModel.findOneAndUpdate({ _id: req.user._id }, { $pull: { cart: { productDetail: product.product._id } } });
                await productModel.findOneAndUpdate({ _id: product._id }, { $inc: { amount: -(product.amount), sold: product.amount } });
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
        const validateError = validateInput(req.body, sellerChangeStatusOfOrder);
        if (validateError) throw validateError;
        const order = await orderModel.findOne({ _id: req.body.orderId, seller: req.user._id });
        if (!order) throw { message: 'Order doesn\'t exists' };
        const status = req.body.status;
        let result;
        if (status === orderStatus.confirm) {
            if (order.status !== orderStatus.confirm) { throw { message: 'You are not allowed to access' } };
            result = await orderModel.findOneAndUpdate({ _id: req.body.orderId }, { status: orderStatus.confirm });
        } else if (status === orderStatus.pickup) {
            if (order.status !== orderStatus.pickup) { throw { message: 'You are not allowed to access' } };
            result = await orderModel.findOneAndUpdate({ _id: req.body.orderId }, { status: orderStatus.shipping })
        } else if (status === orderStatus.cancel) {
            if (order.status !== orderStatus.confirm) throw { message: 'You are not allowed to access' };
            quantity = await product.findOneAndUpdate({ _id: order.product._id }, { $inc: { amount: (order.amount), sold: -(order.amount) } }, { session: session });
            result = await orderModel.findOneAndUpdate({ $and: [{ _id: req.body.orderId }, { $or: [{ owner: req.user._id }, { buyer: req.user._id }] }] }, { status: 'Canceled' }, { session: session });
            await session.commitTransaction();
            if (result.modifiedCount == 0 || quantity.modifiedCount == 0) await session.abortTransaction();
        }
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

module.exports.userChangeOrderStatus = async function(req, res) {
    try {
        const session = await db.startSession();
        session.startTransaction();
        const validateError = validateInput(req.body, userChangeStatusOfOrder);
        if (validateError) { throw validateError; }
        const order = await orderModel.findOne({ _id: req.body.orderId, buyer: req.user._id });
        if (!order) { throw { message: 'Order doesn\'t exists' }; }
        const status = req.body.status;
        let result;
        if (status === orderStatus.finish) {
            if (order.status !== orderStatus.shipping) { throw { message: 'You are not allowed to access' } };
            result = await orderModel.findOneAndUpdate({ _id: req.body.orderId }, { status: orderStatus.finish });
        } else if (status === orderStatus.cancel) {
            if (order.status !== 'waiting-for-confirming') throw { message: 'You are not allowed to access' };
            quantity = await product.findOneAndUpdate({ _id: order.product._id }, { $inc: { amount: (order.amount), sold: -(order.amount) } }, { session: session });
            result = await orderModel.findOneAndUpdate({ $and: [{ _id: req.body.orderId }, { $or: [{ owner: req.user._id }, { buyer: req.user._id }] }] }, { status: orderStatus.cancel }, { session: session });
            await session.commitTransaction();
            if (result.modifiedCount == 0 || quantity.modifiedCount == 0) await session.abortTransaction();
        }
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

module.exports.myOrder = async function(req, res) {
    try {
        const joiVal = validateInput(req.body, checkGetOrder);
        if (joiVal) throw joiVal;
        const page = req.query.page || 1;
        const perPage = 16;
        let skip = (page - 1) * perPage;
        let result, role = req.body.role,
            findQuery = {};
        if (req.body.status === 'all') {
            findQuery = {
                [role]: req.user._id
            };
        } else {
            findQuery = {
                [role]: req.user._id,
                status: req.body.status
            }
        }
        result = await orderModel.find(findQuery)
            .populate({ path: 'buyer', select: { email: 1, phone: 1, name: 1 } })
            .populate({ path: 'owner', select: { email: 1 } })
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