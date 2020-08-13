const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

const sellerChangeStatusOfOrder = Joi.object().keys({
    orderId: Joi.objectId().required(),
    status: Joi.string().required().min(5).max(60).valid(['confirm', 'pick-up', 'cancel'])
})
const userChangeStatusOfOrder = Joi.object().keys({
    orderId: Joi.objectId().required(),
    status: Joi.string().required().min(5).max(60).valid(['finish', 'cancel'])
})
const checkGetOrder = Joi.object().keys({
    status: Joi.string().min(1).max(50).required().valid(['confirm', 'pick-up', 'ship', 'cancel', 'finish', 'all']),
    role: Joi.string().required().min(1).max(50)
})

module.exports.checkGetOrder = checkGetOrder;
module.exports.sellerChangeStatusOfOrder = sellerChangeStatusOfOrder;
module.exports.userChangeStatusOfOrder = userChangeStatusOfOrder;