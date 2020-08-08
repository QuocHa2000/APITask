const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

const changeStatusOfOrder = Joi.object().keys({
    orderId: Joi.objectId().required(),
    status: Joi.string().required().min(5).max(60)
})
const checkGetOrder = Joi.object().keys({
    status: Joi.string().min(1).max(50).required(),
    role: Joi.string().required().min(1).max(50)
})

module.exports.checkGetOrder = checkGetOrder;
module.exports.changeStatusOfOrder = changeStatusOfOrder;