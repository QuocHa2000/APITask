const user = require('../model/user.model');
const jwt = require('jsonwebtoken');
const { JSONCookie } = require('cookie-parser');
const Joi = require('joi');
const { checkUpdateInfo, checkPassword } = require('./infoValidate');
const bcrypt = require('bcryptjs');


module.exports.getMyInfo = async function(req, res) {
    try {
        const result = await user.find({ email: req.user.email });
        res.json({
            code: 0,
            data: result,
            message: "Get info successful"
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
        const result = await user.findOneAndUpdate({ email: req.user.email }, { $set: req.body });
        res.json({
            code: 0,
            message: "Update successful",
            data: result
        })

    } catch (error) {
        res.json({
            message: error.message
        })
    }
}
module.exports.changePassword = async function(req, res) {
    try {
        const { oldPassword, rePassword, newPassword } = req.body;
        Joi.validate(req.body, checkPassword, (err, result) => {
            if (err) throw new Error(err.message);
        })
        if (oldPassword !== rePassword) throw new Error("retype password is incorrect");
        const getUser = await user.findOne({ email: req.user.email });
        const valPassword = await bcrypt.compare(oldPassword, getUser.password);
        if (!valPassword) throw new Error('Your old password is incorrect');
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(newPassword, salt);
        const result = await user.findOneAndUpdate({ email: req.user.email }, { $set: { password: hashPassword } });
        res.json({
            code: 0,
            message: "Change password successful",
            data: result
        })

    } catch (error) {
        res.json({
            message: error.message
        })
    }
}