const Joi = require('joi');

const checkRegisterSchema = Joi.object().keys({
    email: Joi.string().min(11).max(40).email().required(),
    password: Joi.string().min(3).max(30).required(),
    phone: Joi.number().required(),
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

module.exports.checkRegisterSchema = checkRegisterSchema;
module.exports.checkLoginSchema = checkLoginSchema;
module.exports.checkVerifyCodeSchema = checkVerifyCodeSchema;
module.exports.checkVerifyEmailSchema = checkVerifyEmailSchema;
module.exports.checkProductSchema = checkProductSchema;