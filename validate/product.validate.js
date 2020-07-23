const Joi = require('joi');
const checkProductSchema = Joi.object().keys({
    name: Joi.string().min(5).max(100).required(),
    price: Joi.number().required(),
    amount: Joi.number().min(1).max(1000000).required(),
    status: Joi.string().min(1).max(10).required(),
    discount: Joi.number().min(0).max(100).required()
})

module.exports.checkProductSchema = checkProductSchema;