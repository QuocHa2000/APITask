const user = require('../model/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const register = require('../model/register.model');
const { sendMail } = require('../controllers/sendmail');
const { checkRegisterSchema } = require('./registerValidate');


module.exports.register = async function(req, res, next) {
    try {
        await Joi.validate(req.body, checkRegisterSchema);
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(req.body.password, salt);
        const existEmail = await user.findOne({ email: req.body.email });
        if (existEmail) {
            throw { code: 401, message: "Email existed" }

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