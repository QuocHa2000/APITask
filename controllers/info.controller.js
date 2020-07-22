const user = require('../models/user.model');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const { checkUpdateInfo, checkPassword } = require('../validate/info.validate');
const bcrypt = require('bcryptjs');


module.exports.getMyInfo = async function(req, res) {
    try {
        const result = await user.find({ email: req.user.email });
        console.log(result);
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
        const joiVal = Joi.validate(req.body, checkUpdateInfo);
        if (joiVal.error) {
            throw {
                code: 1,
                message: joiVal.error.message,
                data: "Invalid"
            }
        }
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
        const joiVal = Joi.validate(req.body, checkPassword);
        if (joiVal.error) {
            throw {
                code: 1,
                message: joiVal.error.message,
                data: "Invalid"
            }
        }
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