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
        res.json(error)
    }
}
module.exports.updateInfo = async function(req, res) {
    try {
        await Joi.validate(req.body, checkUpdateInfo);
        if (req.body.role == 'admin') throw { code: 403, message: "You are not allowed", value: "Invalid" };
        const result = await user.findOneAndUpdate({ email: req.user.email }, { $set: req.body });
        res.json({
            code: 0,
            message: "Update successful",
            data: result
        })

    } catch (error) {
        res.json(error)
    }
}
module.exports.changePassword = async function(req, res) {
    try {
        const { oldPassword, rePassword, newPassword } = req.body;
        await Joi.validate(req.body, checkPassword, (err, result));
        if (oldPassword !== rePassword) throw { code: 401, message: "retype password is incorrect" };
        const getUser = await user.findOne({ email: req.user.email });
        const valPassword = await bcrypt.compare(oldPassword, getUser.password);
        if (!valPassword) throw { code: 401, message: "your oldpassword is incorrect" };
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(newPassword, salt);
        const result = await user.findOneAndUpdate({ email: req.user.email }, { $set: { password: hashPassword } });
        res.json({
            code: 0,
            message: "Change password successful",
            data: result
        })

    } catch (error) {
        res.json(error)
    }
}