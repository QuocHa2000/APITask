const user = require('../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const register = require('../models/register.model');
const { sendEmail } = require('../utils/sendmail');
const { checkRegisterSchema } = require('../validate/register.validate');
const { checkLoginSchema } = require('../validate/login.validate');
const { checkVerifyCodeSchema, checkVerifyEmailSchema } = require('../validate/verify.validate');
const { joiFunction } = require('../utils/joival');

module.exports.register = async function(req, res, next) {
    try {
        const joiVal = joiFunction(req.body, checkRegisterSchema);
        if (joiVal) throw joiVal;
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(req.body.password, salt);
        const existEmail = await user.findOne({ email: req.body.email });
        if (existEmail) {
            throw { code: 401, message: "Email existed", data: "Invalid" }
        }
        const codeValue = Math.floor(Math.random() * (999999 - 100000)) + 100000;

        await register.create({
            "createdAt": new Date(),
            "email": req.body.email,
            "authCode": codeValue
        })

        const from = '18521308@gm.uit.edu.vn';
        const to = req.body.email;
        const subject = "Hello";
        const link = `http://localhost:4000/verify/resendmail/${req.params.email}`;
        // const html = `Please click this link to verify your email with code ${codeValue} <a href='http://localhost:4000/verify/${req.params.email}'>http://localhost:4000/verify/${req.body.email}</a>`;
        // send mail with defined transport object
        sendEmail(from, to, subject, req.params.email, codeValue, link);

        const newuser = await user.insertMany([{
            email: req.body.email,
            password: hashPassword,
            role: req.body.role,
            name: req.body.name,
            phone: req.body.phone,
            active: false,
            status: 'active'
        }]);
        // let newuser = await user.create(req.body);
        // res.json(newuser);
        res.json({
            code: 0,
            data: newuser,
            message: 'Register success'
        });
    } catch (err) {
        res.json(err)
    }
}

module.exports.login = async function(req, res, next) {
    try {
        const joiVal = joiFunction(req.body, checkLoginSchema);
        if (joiVal) throw joiVal;
        const userEmail = await user.findOne({ email: req.body.email });
        if (!userEmail) {
            throw { code: 401, message: "Username or password is incorrect", data: "Error" };
        }
        if (userEmail.active == false) {
            throw { code: 401, message: "Your account is not activated", data: "Error" };
        }
        const userPassword = await bcrypt.compare(req.body.password, userEmail.password);
        if (!userPassword) {
            throw { code: 401, message: "Username or password is incorrect", data: "Error" };
        }
        const token = await jwt.sign({
            email: userEmail.email,
            userId: userEmail._id
        }, process.env.secret_key);
        res.json({
            code: 0,
            data: userEmail,
            message: "You are login",
            token: token
        })
    } catch (err) {
        res.json(err)
    }
}

module.exports.verify = async function(req, res, next) {
    // Kích hoạt tài khoản đúng email
    try {
        const joiCodeVal = Joi.validate(req.body, checkVerifyCodeSchema);
        if (joiCodeVal.error) {
            throw {
                code: 1,
                message: joiCodeVal.error.message,
                data: "Invalid"
            }
        }
        const joiEmailVal = Joi.validate(req.params, checkVerifyEmailSchema);
        if (joiEmailVal.error) {
            throw {
                code: 1,
                message: joiEmailVal.error.message,
                data: "Invalid"
            }
        }
        const { codeValue } = req.body;
        const userEmail = req.params.email;

        const authUser = await register.findOne({ email: userEmail, authCode: codeValue });
        const registerUser = await user.findOne({ email: userEmail });

        if (registerUser && !authUser) {
            throw { code: 401, message: "Your code expired, Please choose send code again to verify", data: "Invalid" };
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
        const joiVal = joiFunction(req.body, checkVerifyEmailSchema);
        if (joiVal) throw joiVal;
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
            message: " Resend mail successfully"
        })
    } catch (error) {
        res.json(error)
    }
}