const user = require('../model/user.model');
const jwt = require('jsonwebtoken');
const register = require('../model/register.model');
const Joi = require('joi');
const { checkVerifyCodeSchema, checkVerifyEmailSchema } = require('./checkInput');
const { sendMail } = require('./sendmail');


module.exports.verify = async function(req, res, next) {
    // Kích hoạt tài khoản đúng email
    try {
        Joi.validate(req.body, checkVerifyCodeSchema, (err, result) => {
            if (err) throw new Error(err.message);
        })
        Joi.validate(req.params, checkVerifyEmailSchema, (err, result) => {
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

module.exports.resendMail = async function(req, res) {
    try {
        await Joi.validate(req.params, checkVerifyEmailSchema, (err, result) => {
            if (err) throw new Error(err.message)
        });
        const codeValue = Math.floor(Math.random() * (999999 - 100000)) + 100000;

        await register.create({
            "createdAt": new Date(),
            "email": req.params.email,
            "authCode": codeValue
        })

        const from = '18521308@gm.uit.edu.vn';
        const to = req.params.email;
        const subject = "Hello";
        const html = `Please click this link to verify your email with code ${codeValue} <a href='http://localhost:4000/verify/${req.params.email}'>http://localhost:4000/verify/${req.body.email}</a>`;
        // send mail with defined transport object
        sendMail(from, to, subject, html);
        res.json({
            code: 0,
            message: " Resend mail successful"
        })
    } catch (error) {
        res.json({
            message: error.message
        })
    }
}