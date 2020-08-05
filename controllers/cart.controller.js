const user = require('../models/user.model');
const product = require('../models/product.model');
const order = require('../models/order.model');
const { checkUpdateProduct } = require('../validate/updateproduct.validate');
const { joiFunction } = require('../utils/joival');

module.exports.getCart = async function(req, res) {
    try {
        const page = req.query.page || 1;
        const perPage = 4;
        let skip = (page - 1) * perPage;
        const result = await user.find({ _id: req.user._id })
            .populate({ path: 'cart.productDetail' })
            .limit(perPage)
            .skip(skip);
        res.json({
            code: 0,
            message: "Get your cart successfully",
            data: result,
            totalPage: Math.ceil(result.length / perPage)
        })
    } catch (error) {
        res.json({
            code: 1,
            message: error.message,
            data: "Error"
        });
    }
}
module.exports.addToCart = async function(req, res) {
    try {
        const joiVal = joiFunction(req.body, checkUpdateProduct);
        if (joiVal) throw joiVal;
        const addProduct = await product.findOne({ _id: req.body.productId });
        if (!addProduct) throw { message: 'Product doesn\'t exist' };
        if (req.user._id === addProduct.owner) throw { message: 'Can\'t buy your product' };
        let existProduct = req.user.cart.find((product) => product.productDetail.toString() == addProduct._id);
        if (existProduct) {
            existProduct.amount += parseInt(req.body.amount);
        } else {
            req.user.cart.push({ productDetail: req.body.productId, amount: req.body.amount, pick: true });
        }
        await req.user.save();
        const data = await user.findOne({ _id: req.user._id }).populate('cart.productDetail').select({ password: 0 });
        res.json({
            code: 0,
            message: 'Add product to cart successfully',
            data: data
        })
    } catch (error) {
        res.json({
            code: 1,
            message: error.message,
            data: "Error"
        });
    }
}
module.exports.removeProduct = async function(req, res) {
    try {
        const result = await user.findOneAndUpdate({ _id: req.user._id }, { $pull: { cart: { _id: req.body.productId } } });
        res.json({
            code: 0,
            message: "Remove product from your cart successfully",
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

module.exports.changePickProduct = async function(req, res) {
    try {
        const needProduct = await product.findOne({ _id: req.body.productId });
        if (!needProduct) throw { message: 'Product doesn\'t exists' }
        let pickProduct = req.user.cart.find((item) => item.productDetail.toString() === req.body.productId.toString());
        if (!pickProduct) throw { message: 'Product doesn\'t exist in your cart' };
        if (pickProduct.pick === true) {
            pickProduct.pick = false;
        } else {
            pickProduct.pick = true;
        }
        await req.user.save();
        const result = await user.findOne({ _id: req.user._id }).populate('cart.productDetail');
        res.json({
            code: 0,
            message: 'Pick or unpick product successfully',
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
module.exports.changePickAll = async function(req, res) {
    try {
        if (req.body.pick === 'false') req.user.cart.map((product) => product.pick = false)
        else req.user.cart.map((product) => product.pick = true);
        await req.user.save();
        const result = await user.findOne({ _id: req.user._id }).populate('cart.productDetail').select({ password: 0 });
        res.json({
            code: 0,
            message: 'Change pick all successfully',
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

module.exports.updateProduct = async function(req, res) {
    try {
        const needProduct = await product.findOne({ _id: req.body.productId });
        if (!needProduct) throw {
            message: 'Product doesn\'t exists'
        }
        const joiVal = joiFunction(req.body, checkUpdateProduct);
        if (joiVal) throw joiVal;
        const needUser = req.user;
        const userCart = needUser.cart.find((item) => item.productDetail == req.body.productId);
        userCart.amount = req.body.amount;
        await needUser.save();
        const result = await user.findOne({ _id: req.user._id }).populate('cart.productDetail');
        res.json({
            code: 0,
            message: "Update amount product successfully",
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