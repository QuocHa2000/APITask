const Joi = require('joi');

const checkLoginSchema = Joi.object().keys({
    email: Joi.string().min(11).max(40).email().required(),
    password: Joi.string().min(3).max(30).required()
})

module.exports.checkLoginSchema = checkLoginSchema;