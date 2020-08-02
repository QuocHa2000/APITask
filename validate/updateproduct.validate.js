const Joi = require('joi');

const checkUpdateProduct = Joi.object().keys({
    amount: Joi.number().min(1).required()
})

module.exports.checkUpdateProduct = checkUpdateProduct;