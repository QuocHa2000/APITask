const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

const checkPickProduct = Joi.object().keys({
    productId: Joi.objectId().required(),
    pick: Joi.boolean().required()
})
const checkPickProducts = Joi.array().items(checkPickProduct);

module.exports.checkPickProduct = checkPickProducts;