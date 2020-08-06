const user = require('../models/user.model');
const product = require('../models/product.model');
const order = require('../models/order.model');
const { joiFunction } = require('../utils/joival');
const { changeStatusOfOrder } = require('../validate/changestatusorder.validate');
const { checkGetOrder } = require('../validate/checkgetorder.validate');

module.exports.purchaseProduct = async function(req, res) {
    try {
        const allProduct = [...req.user.cart];
        if (allProduct.toString() == [].toString()) throw { message: 'Cart is empty' }
        let pushProduct = [];
        for (item of allProduct) {
            if (item.pick == true) {
                let needProduct = await product.findOne({ _id: item.productDetail });
                pushProduct.push({ product: needProduct, amount: item.amount });
            }
        }
        const newProduct = pushProduct.map(function(item) {
            return {
                ...item,
                buyer: req.user._id,
                owner: item.product.owner,
                status: 'waiting-for-confirming'
            }
        })
        for (item of allProduct) {
            await product.findOneAndUpdate({ _id: item.productDetail }, { $inc: { amount: -(item.amount), sold: item.amount } });
        }
        const result = await order.insertMany(newProduct);
        for (item of newProduct) {
            await user.findOneAndUpdate({ _id: req.user._id }, { $pull: { cart: { productDetail: item.product._id } } });
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
module.exports.changeOrderStatus = async function(req, res) {
    try {
        const joiVal = joiFunction(req.body, changeStatusOfOrder);
        if (joiVal) throw joiVal;
        const needOrder = await order.findOne({ _id: req.body.orderId });
        if (!needOrder) throw { message: 'Order doesn\'t exists' };
        const status = req.body.status;
        let result;
        if (status === 'confirm') {
            if (req.user._id.toString() !== needOrder.owner.toString() || needOrder.status !== 'waiting-for-confirming')
                throw { message: 'You are not allowed to access' }
            result = await order.findOneAndUpdate({ _id: req.body.orderId }, { $set: { status: 'waiting-for-getting-order' } });
        } else if (status === 'getorder') {
            if (req.user._id.toString() !== needOrder.owner.toString() || needOrder.status !== 'waiting-for-getting-order')
                throw { message: 'You are not allowed to access' }
            result = await order.findOneAndUpdate({ _id: req.body.orderId }, { $set: { status: 'Shipping' } })
        } else if (status === 'finishorder') {
            if (needOrder.buyer.toString() !== req.user._id.toString() || needOrder.status !== 'Shipping')
                throw { message: 'You are not allowed to access' };
            result = await order.findOneAndUpdate({ _id: req.body.orderId }, { $set: { status: 'Completed' } })
        } else if (status === 'cancelorder') {
            if (needOrder.status !== 'waiting-for-confirming') throw { message: 'You are not allowed to access' };
            await product.findOneAndUpdate({ _id: needOrder.product._id }, { $inc: { amount: (needOrder.amount), sold: -(needOrder.amount) } });
            result = await order.findOneAndUpdate({ $and: [{ _id: req.body.orderId }, { $or: [{ owner: req.user._id }, { buyer: req.user._id }] }] }, { $set: { status: 'Canceled' } });
        }
        res.json({
            code: 0,
            message: 'Confirm order successfully',
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

// module.exports.gettingOrder = async function(req, res) {
//     try {
//         const joiVal = joiFunction(req.body, changeStatusOrder);
//         if (joiVal) throw joiVal;
//         const needOrder = await order.findOne({ _id: req.body.orderId });
//         if (!needOrder) throw { message: 'Order doesn\'t exists' };
//         if (req.user._id.toString() !== needOrder.owner.toString() || needOrder.status !== 'waiting-for-getting-order') {
//             throw { message: 'You are not allowed to access' }
//         }
//         const result = await order.findOneAndUpdate({ _id: req.body.orderId }, { $set: { status: 'Shipping' } })
//         res.json({
//             code: 0,
//             message: 'Getting order successfully',
//             data: result
//         })
//     } catch (error) {
//         res.json({
//             code: 1,
//             message: error.message,
//             data: 'Error'
//         })
//     }
// }
// module.exports.finishOrder = async function(req, res) {
//     try {
//         const joiVal = joiFunction(req.body, changeStatusOrder);
//         if (joiVal) throw joiVal;
//         const needOrder = await order.findOne({ _id: req.body.orderId });
//         if (!needOrder) throw { message: 'Order doesn\'t exists' }
//         if (needOrder.buyer.toString() !== req.user._id.toString() || needOrder.status !== 'Shipping')
//             throw { message: 'You are not allowed to access' };
//         const result = await order.findOneAndUpdate({ _id: req.body.orderId }, { $set: { status: 'Completed' } })
//         res.json({
//             code: 0,
//             message: 'Finish order successfully',
//             data: result
//         })
//     } catch (error) {
//         res.json({
//             code: 1,
//             message: error.message,
//             data: 'Error'
//         })
//     }
// }
// module.exports.cancelOrder = async function(req, res) {
//     try {
//         const joiVal = joiFunction(req.body, changeStatusOrder);
//         if (joiVal) throw joiVal;
//         const needOrder = await order.findOne({ _id: req.body.orderId });
//         if (!needOrder) throw { message: 'Order doesn\'t exists' };
//         if (needOrder.status !== 'waiting-for-confirming') throw { message: 'You are not allowed to access' };
//         await product.findOneAndUpdate({ _id: needOrder.product._id }, { $inc: { amount: (needOrder.amount), sold: -(needOrder.amount) } });
//         const result = await order.findOneAndUpdate({ $and: [{ _id: req.body.orderId }, { $or: [{ owner: req.user._id }, { buyer: req.user._id }] }] }, { $set: { status: 'Canceled' } });
//         res.json({
//             code: 0,
//             message: "Cancel order successfully",
//             data: result
//         })
//     } catch (error) {
//         res.json({
//             code: 1,
//             message: error.message,
//             data: 'Error'
//         })
//     }
// }
module.exports.myBuyingOrder = async function(req, res) {
    try {
        const joiVal = joiFunction(req.body, checkGetOrder);
        if (joiVal) throw joiVal;
        const page = req.query.page || 1;
        const perPage = 8;
        let skip = (page - 1) * perPage;
        let result;
        if (req.body.status === 'all') {
            result = await order.find({ buyer: req.user._id })
                .populate({ path: 'buyer', select: { email: 1, phone: 1, name: 1 } })
                .populate({ path: 'owner', select: { email: 1 } })
                .limit(perPage)
                .skip(skip);
        } else {
            result = await order.find({ buyer: req.user._id, status: req.body.status })
                .populate({ path: 'buyer', select: { email: 1, phone: 1, name: 1 } })
                .populate({ path: 'owner', select: { email: 1 } })
                .limit(perPage)
                .skip(skip);
        }
        res.json({
            code: 1,
            message: 'Get my buying orders successfully',
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
module.exports.mySellingOrder = async function(req, res) {
    try {
        const joiVal = joiFunction(req.body, checkGetOrder);
        if (joiVal) throw joiVal;
        const page = req.query.page || 1;
        const perPage = 8;
        let skip = (page - 1) * perPage;
        let result;
        if (req.body.status === 'all') {
            result = await order.find({ owner: req.user._id })
                .populate({ path: 'buyer', select: { email: 1, phone: 1, name: 1 } })
                .populate({ path: 'owner', select: { email: 1 } })
                .limit(perPage)
                .skip(skip);
        } else {
            result = await order.find({ owner: req.user._id, status: req.body.status })
                .populate({ path: 'buyer', select: { email: 1, phone: 1, name: 1 } })
                .populate({ path: 'owner', select: { email: 1 } })
                .limit(perPage)
                .skip(skip);
        }
        res.json({
            code: 0,
            message: 'Get all orders successfully',
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