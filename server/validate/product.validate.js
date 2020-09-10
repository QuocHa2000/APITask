const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

module.exports.checkPostProduct = Joi.object().keys({
    name: Joi.string().min(5).max(100).required(),
    price: Joi.number().required(),
    status: Joi.string().min(1).max(10).required().valid(['active', 'blocked']),
    discount: Joi.number().min(0).max(100).required(),
    quantity: Joi.number().min(0).required()
});
module.exports.checkProductDetail = Joi.object().keys({
    id: Joi.objectId(),
});

module.exports.checkUpdateProductSchema = Joi.object().keys({
    _id: Joi.objectId().required(),
    name: Joi.string().min(5).max(100).required(),
    price: Joi.number().required(),
    status: Joi.string().min(1).max(10).required().valid(['active', 'blocked']),
    discount: Joi.number().min(0).max(100).required(),
    quantity: Joi.number().min(0).required()
});
module.exports.checkChangeProductStatus = Joi.object().keys({
    _id: Joi.objectId().required(),
    status: Joi.string().min(1).valid(['active', 'blocked'])
})