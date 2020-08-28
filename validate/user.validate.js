const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

const changeUserStatus = Joi.object().keys({
    _id: Joi.objectId().required(),
    status: Joi.string().min(1).max(50).valid(['active', 'blocked']),
});

module.exports.changeUserStatus = changeUserStatus;