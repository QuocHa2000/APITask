const Joi = require('joi');

const checkUpdateInfo = Joi.object().keys({
    phone: Joi.number().required(),
    role: Joi.string(),
});

const checkPassword = Joi.object().keys({
    oldPassword: Joi.string().min(3).max(30).required(),
    newPassword: Joi.string().min(3).max(30).required(),
    rePassword: Joi.string().min(3).max(30).required()
});

module.exports.checkUpdateInfo = checkUpdateInfo;
module.exports.checkPassword = checkPassword;