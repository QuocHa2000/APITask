const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

const checkPickProduct = Joi.object().keys({
    productId: Joi.objectId().required(),
    pick: Joi.boolean().required()
})
const checkPickProducts = Joi.array().items(checkPickProduct);
const checkUpdateProduct = Joi.object().keys({
    amount: Joi.number().min(1).required(),
    productId: Joi.objectId().required(),
    action: Joi.string().required().min(3).max(6).valid(['add', 'remove', 'update'])
})

module.exports.checkUpdateProduct = checkUpdateProduct;
module.exports.checkPickProducts = checkPickProducts;