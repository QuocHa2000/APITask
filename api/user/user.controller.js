const userService = require('./user.service');
const productService = require('../product/product.service');
const { changeUserStatus } = require('../../validate/user.validate');
const { validateInput } = require('../../utils/validate-input');
const { checkUpdateInfo, checkPassword } = require('../../validate/info.validate');
const bcrypt = require('bcryptjs');
const {
    checkPickProducts,
    checkUpdateProduct,
} = require('../../validate/cart.validate');
const errorMessage = require('../../utils/error-message');

module.exports.findUserForAdmin = async function(req, res) {
    try {
        const page = req.query.page || 1;
        const perPage = 8;
        const foundUser = await userService.getByQuery({
            query: { $text: { $search: req.query.userEmail } },
            page: page,
            perPage: perPage
        })
        res.json({
            code: 0,
            message: 'Find userService successfully',
            data: foundUser,
            totalPage: Math.ceil(foundUser.length / perPage),
        });
    } catch (error) {

        res.json({
            code: 1,
            message: error.message,
            data: 'Error',
        });
    }
};
module.exports.getUsersForAdmin = async function(req, res) {
    try {
        const page = req.query.page || 1;
        const perPage = 8;
        const result = await userService.getByQuery({
            query: {},
            page: page,
            perPage: perPage,
            selected: { password: 0 }
        })
        res.json({
            code: 0,
            data: result,
            message: 'Get all user successfully',
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

module.exports.changeUserStatusForAdmin = async function(req, res) {
    try {
        const validateError = validateInput(req.body, changeUserStatus);
        if (validateError) throw validateError;
        let productStatus;
        if (req.body.status === 'active') productStatus = 'active';
        else productStatus = 'hide';
        const result = await userService.updateById(req.body._id, { status: req.body.status });
        await productService.updateOne({ owner: req.body._id }, { status: productStatus });
        res.json({
            code: 0,
            message: 'Change status successfully',
            data: result,
        });
    } catch (err) {
        res.json({
            code: 1,
            message: err.message,
            data: 'Error',
        });
    }
};

module.exports.getInfoForUser = async function(req, res) {
    try {
        const result = await userService.getOne({ email: req.user.email });
        res.json({
            code: 0,
            data: result,
            message: 'Get info successfully',
        });
    } catch (error) {
        res.json({
            code: 1,
            message: error.message,
            data: 'Error',
        });
    }
};
module.exports.updateInfoForUser = async function(req, res) {
    try {
        const validateError = validateInput(req.body, checkUpdateInfo);
        if (validateError) throw validateError;
        if (req.body.role == 'admin')
            throw {
                message: 'You are not allowed to change your role become admin',
            };
        const result = await userService.updateOne({ email: req.user.email }, { $set: req.body });
        res.json({
            code: 0,
            message: 'Update successfully',
            data: result,
        });
    } catch (error) {
        res.json({
            code: 1,
            message: error.message,
            data: 'Error',
        });
    }
};
module.exports.changePasswordForUser = async function(req, res) {
    try {
        const { oldPassword, newPassword } = req.body;
        const validateError = validateInput(req.body, checkPassword);
        if (validateError) throw validateError;
        const getUser = await userService.getOne({ email: req.user.email });
        const valPassword = await bcrypt.compare(oldPassword, getUser.password);
        if (!valPassword) throw new Error('your old password is incorrect');
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(newPassword, salt);
        const result = await userService.updateOne({ email: req.user.email }, { password: hashPassword });
        res.json({
            code: 0,
            message: 'Change password successfully',
            data: result,
        });
    } catch (error) {
        res.json({
            code: 1,
            message: error.message,
            data: 'Error',
        });
    }
};
module.exports.uploadAvatarForUser = async function(req, res) {
    try {
        req.user.avatar = req.file.path.replace(/\\/g, '/');

        const data = await req.user.save();
        res.json({
            code: 0,
            message: 'Upload Avatar successfully',
            data: data,
        });
    } catch (error) {
        res.json({
            code: 1,
            message: error.message,
            data: 'Error',
        });
    }
};

module.exports.getCartForUser = async function(req, res) {
    try {
        const result = await userService.populate({
            query: { _id: req.user._id },
            populate: { path: 'cart.productId' }
        });
        res.json({
            code: 0,
            message: 'Get your cart successfully',
            data: result,
        });
    } catch (error) {
        res.json({
            code: 1,
            message: error.message,
            data: 'Error',
        });
    }
};
module.exports.changeProductsInCartForUser = async function(req, res) {
    try {
        const validateError = validateInput(req.body, checkUpdateProduct);
        if (validateError) {
            throw validateError;
        }
        const action = req.body.action;
        const product = await productService.getOne({
            _id: req.body.productId,
            owner: { $ne: req.user._id },
        });
        if (!product) {
            throw new Error(errorMessage.PRODUCT_NOT_EXIST);
        }
        let productInCart = req.user.cart.find((item) =>
            item.productId.equals(product._id)
        );
        if (action === 'add') {
            if (productInCart) {
                if (
                    productInCart.amount + parseInt(req.body.amount) >
                    product.quantity
                ) {
                    throw new Error(errorMessage.TOO_MUCH_PRODUCT);
                }
                productInCart.amount += parseInt(req.body.amount);
                productInCart.pick = true;
            } else {
                if (parseInt(req.body.amount) > product.quantity) {
                    throw new Error(errorMessage.TOO_MUCH_PRODUCT);
                }
                req.user.cart.push({
                    productId: req.body.productId,
                    amount: req.body.amount,
                    pick: true,
                });
            }
            await req.user.save();
        } else if (action === 'update') {
            if (!productInCart) {
                throw new Error(errorMessage.PRODUCT_NOT_IN_CART);
            }
            if (parseInt(req.body.amount) > product.quantity) {
                throw new Error(errorMessage.TOO_MUCH_PRODUCT);
            }
            productInCart.amount = req.body.amount;
            await req.user.save();
        } else {
            await userService.updateOne({ _id: req.user._id }, { $pull: { cart: { productId: req.body.productId } } });
        }
        const result = await userService.populateOne({
            query: { _id: req.user._id },
            populate: {
                path: 'cart.productId',
                select: { password: 0 }
            },

        })
        res.json({
            code: 0,
            message: 'Change product in cart successfully',
            data: result,
        });
    } catch (error) {
        res.json({
            code: 1,
            message: error.message,
            data: 'Error',
        });
    }
};
module.exports.pickProductForUser = async function(req, res) {
    try {
        const validateError = validateInput(req.body, checkPickProducts);
        if (validateError) {
            throw validateError;
        }
        const inputProducts = req.body;
        const cart = req.user.cart;

        if (cart.length === 0 || inputProducts.length === 0) {
            throw new Error(errorMessage.CART_EMPTY);
        }
        if (inputProducts.length > cart.length) {
            throw new Error(errorMessage.PRODUCT_IN_CART_LESS_THAN_REQUEST);
        }
        for (const item of inputProducts) {
            let productInCart = cart.find((product) =>
                product.productId.equals(item.productId)
            );
            if (!productInCart) {
                throw {
                    message: `Product ${item.productId} is not in your cart`,
                };
            }
            productInCart.pick = item.pick;
        }
        await req.user.save();
        const result = await userService.populateOne({
            query: { _id: req.user._id },
            populate: {
                path: 'cart.productId',
                select: { password: 0 }
            }
        })
        res.json({
            code: 0,
            message: 'Pick or unpick product successfully',
            data: result,
        });
    } catch (error) {
        res.json({
            code: 1,
            message: error.message,
            data: 'Error',
        });
    }
};