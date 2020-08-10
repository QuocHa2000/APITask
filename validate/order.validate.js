const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

const sellerChangeStatusOfOrder = Joi.object().keys({
    orderId: Joi.objectId().required(),
    status: Joi.string().required().min(5).max(60).valid(['confirm', 'pickup', 'cancel'])
})
const userChangeStatusOfOrder = Joi.object().keys({
    orderId: Joi.objectId().required(),
    status: Joi.string().required().min(5).max(60).valid(['finish', 'cancel'])
})
const checkGetOrder = Joi.object().keys({
    status: Joi.string().min(1).max(50).required().valid(['waiting-for-confirming', 'waiting-for-picking-up', 'shipping', 'canceled', 'completed']),
    role: Joi.string().required().min(1).max(50)
})

module.exports.checkGetOrder = checkGetOrder;
module.exports.sellerChangeStatusOfOrder = sellerChangeStatusOfOrder;
module.exports.userChangeStatusOfOrder = userChangeStatusOfOrder;