const Joi = require('joi');

module.exports.checkVerifyCodeSchema = Joi.object().keys({
    codeValue: Joi.number().min(100000).max(999999).required(),
});
module.exports.checkVerifyEmailSchema = Joi.object().keys({
    email: Joi.string().email().min(10).max(40),
});