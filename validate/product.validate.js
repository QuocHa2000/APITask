const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

const checkPostProduct = Joi.object().keys({
    name: Joi.string().min(5).max(100).required(),
    price: Joi.number().required(),
    amount: Joi.number().min(1).max(1000000).required(),
    status: Joi.string().min(1).max(10).required(),
    discount: Joi.number().min(0).max(100).required()
})
const checkProductDetail = Joi.object().keys({
    id: Joi.objectId()
})

const checkUpdateProductSchema = Joi.object().keys({
    _id: Joi.objectId().required(),
    name: Joi.string().min(5).max(100).required(),
    price: Joi.number().required(),
    amount: Joi.number().min(1).max(1000000).required(),
    status: Joi.string().min(1).max(10).required(),
    discount: Joi.number().min(0).max(100).required()
})

module.exports.checkPostProduct = checkPostProduct;
module.exports.checkProductDetail = checkProductDetail;
module.exports.checkUpdateProductSchema = checkUpdateProductSchema;