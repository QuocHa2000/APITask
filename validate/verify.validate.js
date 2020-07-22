const Joi = require('joi');

const checkVerifyCodeSchema = Joi.object().keys({
    codeValue: Joi.number().min(100000).max(999999).required()
})
const checkVerifyEmailSchema = Joi.object().keys({
    email: Joi.string().email().min(10).max(40)
})

module.exports.checkVerifyCodeSchema = checkVerifyCodeSchema;
module.exports.checkVerifyEmailSchema = checkVerifyEmailSchema;