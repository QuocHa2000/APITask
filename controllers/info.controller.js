const userModel = require('../models/user.model');
const { checkUpdateInfo, checkPassword } = require('../validate/info.validate');
const bcrypt = require('bcryptjs');
const { validateInput } = require('../utils/validateinput');

module.exports.getMyInfo = async function(req, res) {
    try {
        const result = await userModel.find({ email: req.user.email });
        res.json({
            code: 0,
            data: result,
            message: "Get info successfully"
        })
    } catch (error) {
        res.json({
            code: 1,
            message: error.message,
            data: "Error"
        });
    }
}
module.exports.updateInfo = async function(req, res) {
    try {
        const validateError = validateInput(req.body, checkUpdateInfo);
        if (validateError) throw validateError;
        // Not allow user change role become admin
        if (req.body.role == 'admin') throw { message: "You are not allowed to change your role become admin" };
        const result = await userModel.findOneAndUpdate({ email: req.user.email }, { $set: req.body });
        res.json({
            code: 0,
            message: "Update successfully",
            data: result
        })

    } catch (error) {
        res.json({
            code: 1,
            message: error.message,
            data: "Error"
        });
    }
}
module.exports.changePassword = async function(req, res) {
    try {
        const { oldPassword, newPassword } = req.body;
        const validateError = validateInput(req.body, checkPassword);
        if (validateError) throw validateError;
        const getUser = await userModel.findOne({ email: req.user.email });
        const valPassword = await bcrypt.compare(oldPassword, getUser.password);

        if (!valPassword) throw { message: "your old password is incorrect" };
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(newPassword, salt);
        const result = await userModel.findOneAndUpdate({ email: req.user.email }, { $set: { password: hashPassword } });
        res.json({
            code: 0,
            message: "Change password successfully",
            data: result
        })

    } catch (error) {
        res.json({
            code: 1,
            message: error.message,
            data: "Error"
        });
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