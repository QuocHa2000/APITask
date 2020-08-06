const Joi = require('joi');

const checkGetOrder = Joi.object().keys({
    status: Joi.string().min(1).max(50).required()
})

module.exports.checkGetOrder = checkGetOrder;