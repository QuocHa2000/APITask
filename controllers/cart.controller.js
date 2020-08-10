const userModel = require('../models/user.model');
const productModel = require('../models/product.model');
const { checkPickProduct, checkUpdateProduct } = require('../validate/cart.validate')
const { validateInput } = require('../utils/joival');

module.exports.myCart = async function(req, res) {
    try {
        const result = await userModel.find({ _id: req.user._id })
            .populate({ path: 'cart.productDetail' })
        res.json({
            code: 0,
            message: "Get your cart successfully",
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
module.exports.changeInCart = async function(req, res) {
    try {
        const validateError = validateInput(req.body, checkUpdateProduct);
        if (validateError) throw validateError;

        let action = req.body.action;
        const product = await productModel.findOne({ _id: req.body.productId });

        if (!product) throw { message: 'Product doesn\'t exist' };
        if (req.user._id === product.owner) throw { message: 'Can\'t buy your product' };
        let existProduct = req.user.cart.find((item) => item.productDetail.equals(product._id));
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
            await userModel.findOneAndUpdate({ _id: req.user._id }, { $pull: { cart: { productDetail: req.body.productId } } });
        }
        const data = await userModel.findOne({ _id: req.user._id }).populate('cart.productDetail').select({ password: 0 });
        res.json({
            code: 0,
            message: 'Change product in cart successfully',
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
        const validateError = validateInput(req.body, checkPickProduct);
        if (validateError) throw validateError;
        if (req.user.cart.length === 0) throw { message: "Your cart is empty" };
        const inputProductList = req.body;
        const cart = req.user.cart;
        if (inputProductList.length > cart.length) throw { message: "Amount of product in cart is less than your request" };
        for (item of inputProductList) {
            let productInCart = cart.find(pro => pro.productDetail.equals(item.productId));
            if (productInCart) {
                productInCart.pick = item.pick;
            } else {
                throw { message: `${JSON.stringify(item)} is not in your cart` };
            }
        }
        await req.user.save();
        const result = await userModel.findOne({ _id: req.user._id }).populate('cart.productDetail');
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