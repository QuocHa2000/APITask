const {
    changeUserStatus,
    checkUpdateProduct,
    checkPickProducts,
    checkUpdateInfo,
    checkPassword
} = require('../../validate/user.validate');
const { validateInput } = require('../../utils/validate-input');
const errorMessage = require('../../utils/error-message');
const userService = require('../user/user.service');
const productService = require('../product/product.service');
const bcrypt = require('bcryptjs');

module.exports.changeUserStatusForAdminMiddleware = async function(req, res, next) {
    try {
        const validateError = validateInput(req.body, changeUserStatus);
        if (validateError) throw validateError;
        next()
    } catch (error) {
        res.json({
            code: 1,
            message: error.message,
            data: 'Error'
        })
    }
}
module.exports.updateInfoForUserMiddleware = async function(req, res, next) {
    try {
        const validateError = validateInput(req.body, checkUpdateInfo);
        if (validateError) throw validateError;
        if (req.body.role == 'admin') {
            throw new Error('You are not allowed to change your role become admin');
        }
        next();
    } catch (error) {
        res.json({
            code: 1,
            message: error.message,
            data: 'Error'
        })
    }
}
module.exports.changePasswordForUserMiddleware = async function(req, res, next) {
    try {
        const { oldPassword } = req.body;
        const validateError = validateInput(req.body, checkPassword);
        if (validateError) throw validateError;
        const getUser = await userService.getOne({ email: req.user.email });
        const valPassword = await bcrypt.compare(oldPassword, getUser.password);
        if (!valPassword) throw new Error('your old password is incorrect');
        next();
    } catch (error) {
        res.json({
            code: 1,
            message: error.message,
            data: 'Error'
        })
    }
}
module.exports.changeProductInCartForUserMiddleware = async function(req, res, next) {
    try {
        const validateError = validateInput(req.body, checkUpdateProduct);
        if (validateError) {
            throw validateError;
        }
        const product = await productService.getOne({
            _id: req.body.productId,
            owner: { $ne: req.user._id },
        });
        if (!product) {
            throw new Error(errorMessage.PRODUCT_NOT_EXIST);
        }
        req.product = product;
        next();
    } catch (error) {
        res.json({
            code: 1,
            message: error.message,
            data: 'Error'
        })
    }
}
module.exports.checkProductForUserMiddleware = async function(req, res, next) {
    try {
        const validateError = validateInput(req.body, checkPickProducts);
        if (validateError) {
            throw validateError;
        }
        if (req.user.cart.length === 0 || req.body.length === 0) {
            throw new Error(errorMessage.CART_EMPTY);
        }
        if (req.body.length > cart.length) {
            throw new Error(errorMessage.PRODUCT_IN_CART_LESS_THAN_REQUEST);
        }
        next();
    } catch (error) {
        res.json({
            code: 1,
            message: error.message,
            data: 'Error'
        })
    }
}