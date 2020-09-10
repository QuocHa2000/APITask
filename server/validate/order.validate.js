const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

const sellerChangeStatusOfOrder = Joi.object().keys({
    orderId: Joi.objectId().required(),
    status: Joi.string()
        .required()
        .min(5)
        .max(60)
        .valid(['ready', 'shipping', 'canceled']),
});
const buyerChangeStatusOfOrder = Joi.object().keys({
    orderId: Joi.objectId().required(),
    status: Joi.string()
        .required()
        .min(5)
        .max(60)
        .valid(['finished', 'canceled']),
});
const checkGetOrder = Joi.object().keys({
    status: Joi.string()
        .min(1)
        .max(50)
        .required()
        .valid(['pending', 'ready', 'shipping', 'canceled', 'finished', 'all']),
    role: Joi.string().required().min(1).max(50),
});

module.exports.checkGetOrder = checkGetOrder;
module.exports.sellerChangeStatusOfOrder = sellerChangeStatusOfOrder;
module.exports.buyerChangeStatusOfOrder = buyerChangeStatusOfOrder;
