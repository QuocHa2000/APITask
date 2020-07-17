const user = require('../model/user.model');
const jwt = require('jsonwebtoken');
const register = require('../model/register.model');
const Joi = require('joi');
const { checkVerifyCodeSchema, checkVerifyEmailSchema } = require('./verifyValidate');
const { sendEmail } = require('./sendmail');


module.exports.verify = async function(req, res, next) {
    // Kích hoạt tài khoản đúng email
    try {
        await Joi.validate(req.body, checkVerifyCodeSchema);
        await Joi.validate(req.params, checkVerifyEmailSchema);
        const { codeValue } = req.body;
        const userEmail = req.params.email;

        const authUser = await register.findOne({ email: userEmail, authCode: codeValue });
        const registerUser = await user.findOne({ email: userEmail });

        if (registerUser && !authUser) {
            throw { code: 401, message: "Your account is not activated" };
        }
        if (authUser && registerUser) {
            const result = await user.findOneAndUpdate({ email: userEmail }, { active: true });
            res.json({
                code: 0,
                data: result,
                message: 'verify success'
            });
        }
    } catch (err) {
        res.json(err);
    }
}

module.exports.resendMail = async function(req, res) {
    try {
        await Joi.validate(req.params, checkVerifyEmailSchema);
        const codeValue = Math.floor(Math.random() * (999999 - 100000)) + 100000;

        await register.create({
            "createdAt": new Date(),
            "email": req.params.email,
            "authCode": codeValue
        })

        const from = '18521308@gm.uit.edu.vn';
        const to = req.params.email;
        const subject = "Hello";
        const link = `http://localhost:4000/verify/resendmail/${req.params.email}`;
        // const html = `Please click this link to verify your email with code ${codeValue} <a href='http://localhost:4000/verify/${req.params.email}'>http://localhost:4000/verify/${req.body.email}</a>`;
        // send mail with defined transport object
        sendEmail(from, to, subject, req.params.email, codeValue, link);
        res.json({
            code: 0,
            message: " Resend mail successful"
        })
    } catch (error) {
        res.json(error)
    }
}