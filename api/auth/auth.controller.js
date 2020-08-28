const userService = require('../user/user.service');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authService = require('./auth.service');
const { sendEmail } = require('../../utils/send-mail');
const { checkRegisterSchema } = require('../../validate/register.validate');
const { checkLoginSchema } = require('../../validate/login.validate');
const {
    checkVerifyCodeSchema,
    checkVerifyEmailSchema,
} = require('../../validate/verify.validate');
const { validateInput } = require('../../utils/validate-input');

module.exports.register = async function(req, res) {
    try {
        const validateError = validateInput(req.body, checkRegisterSchema);
        if (validateError) throw validateError;
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(req.body.password, salt);
        const existEmail = await userService.getOne({ email: req.body.email });
        if (existEmail) {
            throw new Error('Email existed');
        }
        const codeValue = Math.floor(Math.random() * 899999) + 100000;
        aut
        await authService.create({
            createdAt: new Date(),
            email: req.body.email,
            authCode: codeValue,
        });

        const from = '18521308@gm.uit.edu.vn';
        const to = req.body.email;
        const subject = 'Hello';
        const link = `http://localhost:4000/verify/resendmail/${req.params.email}`;

        const sendMailInput = {
            from,
            to,
            subject,
            name: req.params.email,
            code: codeValue,
            link,
        };
        sendEmail(sendMailInput);
        const newUser = req.body;
        newUser.password = hashPassword;
        newUser.active = false;
        newUser.status = 'active';
        const result = await userService.create(newUser);
        res.json({
            code: 0,
            data: result,
            message: 'Register success',
        });
    } catch (error) {
        res.json({
            code: 1,
            message: error.message,
            data: 'Error',
        });
    }
};

module.exports.login = async function(req, res) {
    try {
        const validateError = validateInput(req.body, checkLoginSchema);
        if (validateError) throw validateError;
        const userEmail = await userService.populateOne({
            query: { email: req.body.email },
            populate: 'cart.productId'
        })
        if (!userEmail) {
            throw new Error('Username or password is incorrect');
        }
        if (userEmail.active == false) {
            throw new Error('Your account is not activated');
        }
        const userPassword = await bcrypt.compare(
            req.body.password,
            userEmail.password
        );
        if (!userPassword) {
            throw new Error('Username or password is incorrect');
        }
        const token = await jwt.sign({
                email: userEmail.email,
                userId: userEmail._id,
            },
            process.env.secret_key
        );
        res.json({
            code: 0,
            data: userEmail,
            message: 'You are login',
            token: token,
        });
    } catch (error) {
        res.json({
            code: 1,
            message: error.message,
            data: 'Error',
        });
    }
};

module.exports.verify = async function(req, res) {
    try {
        const validateCodeError = validateInput(
            req.body,
            checkVerifyCodeSchema
        );
        if (validateCodeError) throw validateCodeError;
        const validateEmailError = validateInput(
            req.params,
            checkVerifyEmailSchema
        );
        if (validateEmailError) throw validateEmailError;

        const { codeValue } = req.body;
        const userEmail = req.params.email;

        const authUser = await authService.getOne({
            email: userEmail,
            authCode: codeValue,
        });
        const registerUser = await userService.getOne({ email: userEmail });

        if (registerUser && !authUser) {
            throw {
                message: 'Your code expired, Please choose send code again to verify',
            };
        }
        if (authUser && registerUser) {
            const result = await userService.updateOne({ email: userEmail }, { active: true });
            res.json({
                code: 0,
                data: result,
                message: 'verify success',
            });
        }
    } catch (error) {
        res.json({
            code: 1,
            message: error.message,
            data: 'Error',
        });
    }
};

module.exports.resendMail = async function(req, res) {
    try {
        const validateError = validateInput(req.body, checkVerifyEmailSchema);
        if (validateError) throw validateError;
        const codeValue = Math.floor(Math.random() * 899999) + 99999;
        await authService.create({
            createdAt: new Date(),
            email: req.params.email,
            authCode: codeValue,
        });

        const from = '18521308@gm.uit.edu.vn';
        const to = req.params.email;
        const subject = 'Hello';
        const link = `http://localhost:4000/verify/resendmail/${req.params.email}`;

        const sendMailInput = {
            from,
            to,
            subject,
            name: req.params.email,
            code: codeValue,
            link,
        };
        sendEmail(sendMailInput);
        res.json({
            code: 0,
            message: ' Resend mail successfully',
        });
    } catch (error) {
        res.json({
            code: 1,
            message: error.message,
            data: 'Error',
        });
    }
};