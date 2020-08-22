const userModel = require('../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const registerModel = require('../models/register.model');
const { sendEmail } = require('../utils/sendmail');
const { checkRegisterSchema } = require('../validate/register.validate');
const { checkLoginSchema } = require('../validate/login.validate');
const { checkVerifyCodeSchema, checkVerifyEmailSchema } = require('../validate/verify.validate');
const { validateInput } = require('../utils/validateinput');

module.exports.register = async function(req, res, next) {
    try {
        const validateError = validateInput(req.body, checkRegisterSchema);
        if (validateError) throw validateError;
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(req.body.password, salt);
        const existEmail = await userModel.findOne({ email: req.body.email });
        if (existEmail) {
            throw { message: "Email existed" }
        }
        const codeValue = Math.floor(Math.random() * (899999)) + 100000;

        await registerModel.create({
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

        const newuser = await userModel.create({
            email: req.body.email,
            password: hashPassword,
            role: req.body.role,
            name: req.body.name,
            phone: req.body.phone,
            active: false,
            status: 'active'
        });
        res.json({
            code: 0,
            data: newuser,
            message: 'Register success'
        });
    } catch (err) {
        res.json({
            code: 1,
            message: error.message,
            data: "Error"
        });
    }
}

module.exports.login = async function(req, res, next) {
    try {
        const validateError = validateInput(req.body, checkLoginSchema);
        if (validateError) throw validateError;
        const userEmail = await userModel.findOne({ email: req.body.email }).populate('cart.productId');
        if (!userEmail) {
            throw { message: "Username or password is incorrect" };
        }
        if (userEmail.active == false) {
            throw { message: "Your account is not activated" };
        }
        const userPassword = await bcrypt.compare(req.body.password, userEmail.password);
        if (!userPassword) {
            throw { message: "Username or password is incorrect" };
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
        res.json({
            code: 1,
            message: error.message,
            data: "Error"
        });
    }
}

module.exports.verify = async function(req, res, next) {
    // Kích hoạt tài khoản đúng email
    try {
        const validateCodeError = validateInput(req.body, checkVerifyCodeSchema);
        if (validateCodeError) throw validateError;
        const validateEmailError = validateInput(req.params, checkVerifyEmailSchema);
        if (validateEmailError) throw validateError;

        const { codeValue } = req.body;
        const userEmail = req.params.email;

        const authUser = await registerModel.findOne({ email: userEmail, authCode: codeValue });
        const registerUser = await userModel.findOne({ email: userEmail });

        if (registerUser && !authUser) {
            throw { message: "Your code expired, Please choose send code again to verify" };
        }
        if (authUser && registerUser) {
            const result = await userModel.findOneAndUpdate({ email: userEmail }, { active: true }, { new: true });
            res.json({
                code: 0,
                data: result,
                message: 'verify success'
            });
        }
    } catch (err) {
        res.json({
            code: 1,
            message: error.message,
            data: "Error"
        });
    }
}

module.exports.resendMail = async function(req, res) {
    try {
        const validateError = validateInput(req.body, checkVerifyEmailSchema);
        if (validateError) throw validateError;
        const codeValue = Math.floor(Math.random() * 899999) + 100000;

        await registerModel.create({
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
        res.json({
            code: 1,
            message: error.message,
            data: "Error"
        });
    }
}