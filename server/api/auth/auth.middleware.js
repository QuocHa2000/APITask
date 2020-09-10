const { validateInput } = require('../../utils/validate-input');
const userService = require('../user/user.service');
const {
    checkLoginSchema,
    checkRegisterSchema,
    checkVerifyCodeSchema,
    checkVerifyEmailSchema
} = require('../../validate/auth.validate');
const bcrypt = require('bcryptjs');

module.exports.loginMiddleware = async function(req, res, next) {
    try {
        const validateError = validateInput(req.body, checkLoginSchema);
        if (validateError) throw validateError;
        const userEmail = await userService.populateOne({
            query: { email: req.body.email },
            populate: 'cart.productId'
        })
        if (!userEmail) {
            throw new Error('Username or password is incorrect');
        }
        if (userEmail.active == false) {
            throw new Error('Your account is not activated');
        }
        const userPassword = await bcrypt.compare(
            req.body.password,
            userEmail.password
        );
        if (!userPassword) {
            throw new Error('Username or password is incorrect');
        }
        req.user = userEmail;
        next();
    } catch (error) {
        res.json({
            code: 1,
            message: error.message,
            data: 'Error'
        })
    }
}
module.exports.registerMiddleware = async function(req, res, next) {
    try {
        const validateError = validateInput(req.body, checkRegisterSchema);
        if (validateError) throw validateError;
        const existEmail = await userService.getOne({ email: req.body.email });
        if (existEmail) {
            throw new Error('Email existed');
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
module.exports.verifyMiddleware = async function(req, res, next) {
    try {
        const validateCodeError = validateInput(
            req.body,
            checkVerifyCodeSchema
        );
        if (validateCodeError) throw validateCodeError;
        const validateEmailError = validateInput(
            req.params,
            checkVerifyEmailSchema
        );
        if (validateEmailError) throw validateEmailError;
        next();
    } catch (error) {
        res.json({
            code: 1,
            message: error.message,
            data: 'Error'
        })
    }
}
module.exports.resendMailMiddleware = async function(req, res, next) {
    try {
        const validateError = validateInput(req.body, checkVerifyEmailSchema);
        if (validateError) {
            throw validateError;
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