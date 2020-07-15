const Joi = require('joi');

const checkRegisterSchema = Joi.object().keys({
    email: Joi.string().min(11).max(40).email().required(),
    password: Joi.string().min(3).max(30).required(),
    phone: Joi.number().required().min(99999999).max(1000000000000),
    name: Joi.string().required().min(1).max(50),
    company: Joi.string(),
    role: Joi.string()
})

const checkLoginSchema = Joi.object().keys({
    email: Joi.string().min(11).max(40).email().required(),
    password: Joi.string().min(3).max(30).required()
})

const checkVerifyCodeSchema = Joi.object().keys({
    codeValue: Joi.number().min(100000).max(999999).required()
})
const checkVerifyEmailSchema = Joi.object().keys({
    email: Joi.string().email().min(10).max(40)
})
const checkProductSchema = Joi.object().keys({
    name: Joi.string().min(5).max(100).required(),
    price: Joi.number().required()
})
const checkUpdateInfo = Joi.object().keys({
    phone: Joi.number().required(),
    role: Joi.string()
})
const checkPassword = Joi.object().keys({
    oldpassword: Joi.string().min(3).max(30).required(),
    repassword: Joi.string().min(3).max(30).required(),
    newpassword: Joi.string().min(3).max(30).required()
})
module.exports.checkRegisterSchema = checkRegisterSchema;
module.exports.checkLoginSchema = checkLoginSchema;
module.exports.checkVerifyCodeSchema = checkVerifyCodeSchema;
module.exports.checkVerifyEmailSchema = checkVerifyEmailSchema;
module.exports.checkProductSchema = checkProductSchema;
module.exports.checkUpdateInfo = checkUpdateInfo;
module.exports.checkPassword = checkPassword;