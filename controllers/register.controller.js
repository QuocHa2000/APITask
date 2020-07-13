const user = require('../model/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const register = require('../model/register.model');
const { sendMail } = require('../controllers/sendmail');
const { checkRegisterSchema } = require('./checkInput');


module.exports.register = async function(req, res, next) {

    try {
        Joi.validate(req.body, checkRegisterSchema, (err, result) => {
            if (err) throw new Error(err.message);
        })
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(req.body.password, salt);

        let existEmail = await user.findOne({ email: req.body.email });
        if (existEmail) {
            throw new Error('Email is exists');
        }

        let token = await jwt.sign({
            userEmail: req.body.email
        }, process.env.secret_key);

        let codeValue = Math.floor(Math.random() * (999999 - 100000)) + 100000;

        await register.create({
            "createdAt": new Date(),
            "email": req.body.email,
            "authCode": codeValue
        })

        let from = '18521308@gm.uit.edu.vn';
        let to = req.body.email;
        let subject = "Hello";
        let html = `Please click this link to verify your email with code ${codeValue} <a href='http://localhost:4000/verify/${req.body.email}'>http://localhost:4000/verify/${req.body.email}</a>`;
        // send mail with defined transport object
        sendMail(from, to, subject, html);

        let newuser = await user.insertMany([{
            email: req.body.email,
            password: hashPassword,
            role: req.body.role,
            name: req.body.name,
            phone: req.body.phone,
            active: false
        }]);
        // let newuser = await user.create(req.body);
        // res.json(newuser);
        res.json({
            code: 0,
            data: newuser,
            message: 'Register success'
        });
    } catch (err) {
        res.json({
            message: err.message
        })
    }
}