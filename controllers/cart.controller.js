const user = require('../models/user.model');
const product = require('../models/product.model');
const order = require('../models/order.model');
const { checkUpdateProduct } = require('../validate/updateproduct.validate');
const { checkPickProduct } = require('../validate/checkpick.validate');
const { joiFunction } = require('../utils/joival');
const joiObjectid = require('joi-objectid');

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
module.exports.changeInCart = async function(req, res) {
    try {
        const joiVal = joiFunction(req.body, checkUpdateProduct);
        if (joiVal) throw joiVal;
        let action = req.body.action;
        if (action !== 'add' && action !== 'update' && action !== 'remove') throw { message: 'Wrong action' };
        const addProduct = await product.findOne({ _id: req.body.productId });
        if (!addProduct) throw { message: 'Product doesn\'t exist' };
        if (req.user._id === addProduct.owner) throw { message: 'Can\'t buy your product' };
        let existProduct = req.user.cart.find((product) => product.productDetail.toString() == addProduct._id);
        if (action === 'add') {
            if (existProduct) {
                existProduct.amount += parseInt(req.body.amount);
            } else {
                req.user.cart.push({ productDetail: req.body.productId, amount: req.body.amount, pick: true });
            }
            await req.user.save();
        } else if (action === 'update') {
            if (!existProduct) throw { message: "Product doesn\'t exists in your cart" };
            existProduct.amount = req.body.amount;
            await req.user.save();
        } else if (action === 'remove') {
            if (!existProduct) throw { message: "Product doesn\'t exists in your cart" };
            await user.findOneAndUpdate({ _id: req.user._id }, { $pull: { cart: { productDetail: req.body.productId } } });
        }
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


module.exports.changePickProduct = async function(req, res) {
    try {
        const joiVal = joiFunction(req.body, checkPickProduct);
        if (joiVal) throw joiVal;
        if (JSON.stringify(req.user.cart) === JSON.stringify([])) throw { message: "Your cart is empty" };
        const productsArray = req.body;
        const productsInCart = req.user.cart;
        for (pro of productsArray) {
            let productInCart = productsInCart.find(item => item.productDetail.toString() == pro.productId.toString());
            productInCart.pick = pro.pick;
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