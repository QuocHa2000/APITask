const user = require('../models/user.model');
const product = require('../models/product.model');
const order = require('../models/order.model');


module.exports.getCart = async function(req, res) {
    try {
        const result = await user.find({ _id: req.user._id })
            .populate({ path: 'cart.productDetail' });
        console.log(result);
        res.json({
            code: 0,
            message: "Get your cart successfully",
            data: result
        })
    } catch (error) {
        res.json(error);
    }
}
module.exports.addToCart = async function(req, res) {
    try {
        const addProduct = await product.findOne({ _id: req.params.id });
        if (!addProduct) throw { code: 1, message: 'Product doesn\'t exist', data: 'Invalid' };
        let existProduct = req.user.cart.find((product) => product.productDetail.toString() == addProduct._id);
        if (existProduct) {
            existProduct.amount += parseInt(req.body.amount);
        } else {
            req.user.cart.push({ productDetail: req.params.id, amount: req.body.amount });
        }
        const data = await req.user.save();
        res.json({
            code: 0,
            message: 'Add product to cart successfully',
            data: data
        })
    } catch (error) {
        res.json(error);
    }
}
module.exports.removeProduct = async function(req, res) {
    try {
        const result = await user.findOneAndUpdate({ _id: req.user._id }, { $pull: { cart: { _id: req.params.id } } });
        res.json({
            code: 0,
            message: "Remove product from your cart successfully",
            data: result
        })
    } catch (error) {
        res.json(error);
    }
}
module.exports.purchaseProduct = async function(req, res) {
    try {
        const needProduct = await product.findOne({ _id: req.params.id });
        console.log(needProduct.sellPrice);
        const result = await order.create({
            product: req.params.id,
            buyer: req.user._id,
            owner: needProduct.owner,
            amount: req.body.amount,
            sellPrice: needProduct.sellPrice
        })
        res.json({
            code: 0,
            message: 'Purchase product successfully',
            data: result
        })
    } catch (error) {
        res.json(error);
    }
}
module.exports.purchaseAllProduct = async function(req, res) {
    try {
        const allProduct = [...req.user.cart];
        let allOrder = [];
        let needProduct;
        for (item of allProduct) {
            needProduct = await product.findOne({ _id: item.productDetail })
            allOrder.push({
                product: item.productDetail,
                buyer: req.user._id,
                owner: needProduct.owner,
                amount: item.amount,
                sellPrice: needProduct.sellPrice
            })
        }
        const result = await order.insertMany(allOrder);
        res.json({
            code: 0,
            message: "Purchase all product successfully",
            data: result
        })
    } catch (error) {
        res.json(error);
    }
}
module.exports.getOrder = async function(req, res) {
    try {
        const result = await order.find({ owner: req.user._id })
            .populate({ path: 'product', select: { _id: 0 } })
            .populate({ path: 'buyer', select: { email: 1, phone: 1, name: 1 } })
            .populate({ path: 'owner' })
        res.json({
            code: 0,
            message: 'Get all orders successfully',
            data: result
        })
    } catch (error) {
        res.json(error);
    }
}
module.exports.finishOrder = async function(req, res) {
    try {
        const needOrder = await order.findOne({ _id: req.params.id });
        if (needOrder.buyer.toString() !== req.user._id.toString()) throw { code: 1, message: 'You are not allowed to access', data: 'Invalid' };
        await product.findOneAndUpdate({ _id: needOrder.product }, { $inc: { amount: -(needOrder.amount) } });
        const result = await order.findOneAndDelete({ _id: req.params.id });
        res.json({
            code: 0,
            message: 'Finish order successfully',
            data: result
        })
    } catch (error) {
        res.json(error);
    }
}
module.exports.cancelOrder = async function(req, res) {
    try {
        let result;
        if (req.user.role == 'enterprise') {
            result = await order.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
        } else {
            result = await order.findOneAndDelete({ _id: req.params.id, buyer: req.user._id });
        }
        res.json({
            code: 0,
            message: "Cancel order successfully",
            data: result
        })
    } catch (error) {
        res.json(error);
    }
}