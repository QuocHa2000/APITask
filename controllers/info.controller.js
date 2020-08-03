const user = require('../models/user.model');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const { checkUpdateInfo, checkPassword } = require('../validate/info.validate');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const { joiFunction } = require('../utils/joival')



module.exports.getMyInfo = async function(req, res) {
    try {
        const result = await user.find({ email: req.user.email });
        res.json({
            code: 0,
            data: result,
            message: "Get info successfully"
        })
    } catch (error) {
        res.json(error)
    }
}
module.exports.updateInfo = async function(req, res) {
    try {
        const joiVal = joiFunction(req.body, checkUpdateInfo);
        if (joiVal) throw joiVal;
        // Not allow user change role become admin
        if (req.body.role == 'admin') throw { code: 403, message: "You are not allowed to change your role become admin", data: "Error" };
        const result = await user.findOneAndUpdate({ email: req.user.email }, { $set: req.body });
        res.json({
            code: 0,
            message: "Update successfully",
            data: result
        })

    } catch (error) {
        res.json(error)
    }
}
module.exports.changePassword = async function(req, res) {
    try {
        const { oldPassword, newPassword } = req.body;
        const joiVal = joiFunction(req.body, checkPassword);
        if (joiVal) throw joiVal;
        const getUser = await user.findOne({ email: req.user.email });
        const valPassword = await bcrypt.compare(oldPassword, getUser.password);

        if (!valPassword) throw { code: 401, message: "your old password is incorrect", data: "Error" };
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(newPassword, salt);
        const result = await user.findOneAndUpdate({ email: req.user.email }, { $set: { password: hashPassword } });
        res.json({
            code: 0,
            message: "Change password successfully",
            data: result
        })

    } catch (error) {
        res.json(error)
    }
}
module.exports.uploadAvatar = async function(req, res) {
    try {
        req.user.avatar = req.file.path.replace(/\\/g, "/");

        const data = await req.user.save();
        res.json({
            code: 0,
            message: 'Upload Avatar successfully',
            data: data
        })
    } catch (error) {
        res.json({
            code: 1,
            message: error.message,
            data: 'Error'
        })
    }
}