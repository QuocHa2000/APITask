const user = require('../model/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const { checkLoginSchema } = require('./checkInput');


module.exports.login = async function(req, res, next) {
    try {
        Joi.validate(req.body, checkLoginSchema, (err, result) => {
            if (err) throw new Error(err.message);
        })
        const userEmail = await user.findOne({ email: req.body.email });
        if (!userEmail) {
            throw new Error('Username or password is incorrect');
        }
        if (userEmail.active == false) {
            throw new Error('Your account is not activated');
        }
        const userPassword = await bcrypt.compare(req.body.password, userEmail.password);
        if (!userPassword) {
            throw new Error('Username or password is incorrect');
        }

        let token = await jwt.sign({
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
            message: err.message
        })
    }
}