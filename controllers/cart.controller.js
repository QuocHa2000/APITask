const userModel = require('../models/user.model');
const productModel = require('../models/product.model');
const { checkPickProducts, checkUpdateProduct } = require('../validate/cart.validate');
const { validateInput } = require('../utils/validateinput');
const errorMessage = require('../utils/errormessage');

module.exports.getMyCart = async function(req, res) {
    try {
        const result = await userModel
            .findById(req.user._id)
            .populate({ path: 'cart.productId' })
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
module.exports.changeProductsInCart = async function(req, res) {
    try {
        const validateError = validateInput(req.body, checkUpdateProduct);
        if (validateError) throw validateError;

        const action = req.body.action;
        const product = await productModel.findOne({ _id: req.body.productId, owner: { $ne: req.user._id } });
        if (!product) {
            throw { message: errorMessage.PRODUCT_NOT_EXIST };
        }
        let productInCart = req.user.cart.find(item => item.productId.equals(product._id));
        if (action === 'add') {
            if (productInCart) {
                if (productInCart.amount + parseInt(req.body.amount) > product.quantity) {
                    throw { message: errorMessage.TOO_MUCH_PRODUCT };
                }
                productInCart.amount += parseInt(req.body.amount);
                productInCart.pick = true;
            } else {
                if (parseInt(req.body.amount) > product.quantity) {
                    throw { message: errorMessage.TOO_MUCH_PRODUCT };
                }
                req.user.cart.push({ productId: req.body.productId, amount: req.body.amount, pick: true });
            }
            await req.user.save();
        } else if (action === 'update') {
            if (!productInCart) {
                throw { message: errorMessage.PRODUCT_NOT_IN_CART };
            }
            if (parseInt(req.body.amount) > product.quantity) {
                throw { message: errorMessage.TOO_MUCH_PRODUCT }
            }
            productInCart.amount = req.body.amount;
            await req.user.save();
        } else {
            await userModel.updateOne({ _id: req.user._id }, { $pull: { cart: { productId: req.body.productId } } });
        }
        const result = await userModel
            .findById(req.user._id)
            .populate('cart.productId')
            .select({ password: 0 });
        res.json({
            code: 0,
            message: 'Change product in cart successfully',
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
module.exports.pickProduct = async function(req, res) {
    try {
        const validateError = validateInput(req.body, checkPickProducts);
        if (validateError) throw validateError;

        const inputProducts = req.body;
        const cart = req.user.cart;

        if (cart.length === 0 || inputProducts.length === 0) {
            throw { message: errorMessage.CART_EMPTY };
        }
        if (inputProducts.length > cart.length) {
            throw { message: "Amount of product in cart is less than your request" };
        }
        for (const item of inputProducts) {
            let productInCart = cart.find(product => product.productId.equals(item.productId));
            if (!productInCart) {
                throw { message: `Product ${item.productId} is not in your cart` };
            }
            productInCart.pick = item.pick;
        }
        await req.user.save();
        const result = await userModel
            .findById(req.user._id)
            .populate('cart.productId')
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