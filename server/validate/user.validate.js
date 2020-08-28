const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

module.exports.changeUserStatus = Joi.object().keys({
    _id: Joi.objectId().required(),
    status: Joi.string().min(1).max(50).valid(['active', 'blocked']),
});
const checkPickProduct = Joi.object().keys({
    productId: Joi.objectId().required(),
    pick: Joi.boolean().required(),
});

module.exports.checkPickProducts = Joi.array().items(checkPickProduct);
module.exports.checkUpdateProduct = Joi.object().keys({
    amount: Joi.number().min(1).required(),
    productId: Joi.objectId().required(),
    action: Joi.string()
        .required()
        .min(3)
        .max(6)
        .valid(['add', 'remove', 'update']),
});