const user = require('../model/user.model');
const jwt = require('jsonwebtoken');
const register = require('../model/register.model');
const Joi = require('joi');
const { checkVerifyCodeSchema, checkVerifyEmailSchema } = require('./checkInput');


module.exports.verify = async function(req, res, next) {
    // Kích hoạt tài khoản đúng email
    try {
        Joi.validate(req.body, checkVerifyCodeSchema, (err, result) => {
            if (err) throw new Error(err.message);
        })
        Joi.validate(req.params, checkVerifyCodeSchema, (err, result) => {
            if (err) throw new Error(err.message);
        })
        let { codeValue } = req.body;
        let userEmail = req.params.email;

        let authUser = await register.findOne({ email: userEmail, authCode: codeValue });
        let registerUser = await user.findOne({ email: userEmail });

        if (registerUser && !authUser) {
            throw new Error("Your account is not activated");
        }
        if (authUser && registerUser) {
            await user.findOneAndUpdate({ email: userEmail }, { active: true }, (err, result) => {
                if (err) throw new Error(err.message);
                else res.json({
                    code: 0,
                    data: result,
                    message: 'verify success'
                });
            })
        }
    } catch (err) {
        res.json({
            message: err.message
        })
    }
}