const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

const changeStatusOfOrder = Joi.object().keys({
    orderId: Joi.objectId().required(),
    status: Joi.string().required().min(5).max(60)
})

module.exports.changeStatusOfOrder = changeStatusOfOrder;