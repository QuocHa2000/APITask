const userModel = require('../models/user.model');
const product = require('../models/product.model');
const { changeUserStatus } = require('../validate/user.validate');
const { validateInput } = require('../utils/validateinput');
module.exports.findUser = async function(req, res) {
    try {
        const page = req.query.page || 1;
        const perPage = 8;
        let skip = (page - 1) * perPage;
        const foundUser = await userModel.find({ email: new RegExp(req.query.userEmail) }).limit(perPage).skip(skip);
        res.json({
            code: 0,
            message: "Find userModel successfully",
            data: foundUser,
            totalPage: Math.ceil(result.length / perPage)
        })
    } catch (error) {
        res.json({
            code: 1,
            message: error.message,
            data: "Error"
        });
    }
}
module.exports.getUsers = async function(req, res) {
    try {
        const page = req.query.page || 1;
        const perPage = 8;
        let skip = (page - 1) * perPage;
        const result = await userModel.find({}, { password: 0 }).limit(perPage).skip(skip);
        res.json({
            code: 0,
            data: result,
            message: "Get all user successfully",
            totalPage: Math.ceil(result.length / perPage)
        })
    } catch (error) {
        res.json({
            code: 1,
            message: error.message,
            data: "Error"
        });
    }
}

module.exports.changeUserStatus = async function(req, res) {
    try {
        const validateError = validateInput(req.body, changeUserStatus);
        if (validateError) throw validateError;
        let productStatus;
        if (req.body.status === 'active') productStatus = 'active';
        else productStatus = 'hide';
        const result = await userModel.findOneAndUpdate({ _id: req.body.id }, { $set: { status: req.body.status } });
        await product.updateMany({ owner: req.body.id }, { $set: { status: productStatus } });
        res.json({
            code: 0,
            message: "Change status successfully",
            data: result
        })
    } catch (err) {
        res.json({
            code: 1,
            message: error.message,
            data: "Error"
        });
    }
}