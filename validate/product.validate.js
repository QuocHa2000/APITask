const Joi = require('joi');
const checkProductSchema = Joi.object().keys({
    name: Joi.string().min(5).max(100).required(),
    price: Joi.number().required(),
    amount: Joi.number().min(1).max(1000000).required()
})

module.exports.checkProductSchema = checkProductSchema;