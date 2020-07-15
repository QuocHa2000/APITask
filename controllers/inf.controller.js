const user = require('../model/user.model');
const jwt = require('jsonwebtoken');
const { JSONCookie } = require('cookie-parser');
const Joi = require('joi');
const { checkUpdateInfo, checkPassword } = require('./checkInput');
const bcrypt = require('bcryptjs');


module.exports.getMyInfo = async function(req, res) {
    try {
        await user.find({ email: req.user.email }, (err, result) => {
            if (err) throw new Error(err.message);
            else {
                res.json({
                    code: 0,
                    data: result,
                    message: "Get info successful"
                })
            }
        })
    } catch (error) {
        res.json({
            message: error.message
        })
    }

}
module.exports.updateInfo = async function(req, res) {
    try {
        Joi.validate(req.body, checkUpdateInfo, (err, result) => {
            if (err) throw new Error(err.message);
        });
        if (req.body.role == 'admin') throw new Error('You are not allowed');
        await user.findOneAndUpdate({ email: req.user.email }, { $set: req.body }, (err, result) => {
            if (err) throw new Error(err.message);
            else res.json({
                code: 0,
                message: "Update successful",
                data: result
            })
        })

    } catch (error) {
        res.json({
            message: error.message
        })
    }

}
module.exports.changePassword = async function(req, res) {
    try {
        const { oldpassword, repassword, newpassword } = req.body;
        Joi.validate(req.body, checkPassword, (err, result) => {
            if (err) throw new Error(err.message);
        })
        if (oldpassword !== repassword) throw new Error("retype password is incorrect");
        await user.findOne({ email: req.user.email }, async(err, result) => {
            if (err) throw new Error(err.message);
            else {
                await brypt.compare(oldpassword, result.password, (err, result) => {
                    if (err) throw new Error(err.message);
                })
            }
        })
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(req.body.newpassword, salt);
        await user.findOneAndUpdate({ email: req.user.email }, { $set: { password: hashPassword } }, async(err, result) => {
            if (err) throw new Error(err.message);
            else res.json({
                code: 0,
                message: "Change password successful",
                data: result
            })
        })

    } catch (error) {
        res.json({
            message: error.message
        })
    }
}