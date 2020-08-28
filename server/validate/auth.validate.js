const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

module.exports.checkLoginSchema = Joi.object().keys({
    email: Joi.string().min(11).max(40).email().required(),
    password: Joi.string().min(3).max(30).required(),
});
module.exports.checkRegisterSchema = Joi.object().keys({
    email: Joi.string().min(11).max(40).email().required(),
    password: Joi.string().min(3).max(30).required(),
    phone: Joi.number().required().min(99999999).max(1000000000000),
    name: Joi.string().required().min(1).max(50),
    company: Joi.string(),
    role: Joi.string().valid(['user', 'enterprise']),
});

module.exports.checkVerifyCodeSchema = Joi.object().keys({
    codeValue: Joi.number().min(100000).max(999999).required(),
});
module.exports.checkVerifyEmailSchema = Joi.object().keys({
    email: Joi.string().email().min(10).max(40),
});