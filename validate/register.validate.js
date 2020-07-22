const Joi = require('joi');

const checkRegisterSchema = Joi.object().keys({
    email: Joi.string().min(11).max(40).email().required(),
    password: Joi.string().min(3).max(30).required(),
    phone: Joi.number().required().min(99999999).max(1000000000000),
    name: Joi.string().required().min(1).max(50),
    company: Joi.string(),
    role: Joi.string()
})

module.exports.checkRegisterSchema = checkRegisterSchema;