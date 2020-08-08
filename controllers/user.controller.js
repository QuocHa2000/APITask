const user = require('../models/user.model');
const product = require('../models/product.model');
const { changeUserStatus } = require('../validate/user.validate');
const { joiFunction } = require('../utils/joival');
module.exports.findUser = async function(req, res) {
    try {
        const page = req.query.page || 1;
        const perPage = 8;
        let skip = (page - 1) * perPage;
        const foundUser = await user.find({ email: new RegExp(req.query.userEmail) }).limit(perPage).skip(skip);
        res.json({
            code: 0,
            message: "Find user successfully",
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
        const result = await user.find({}, { password: 0 }).limit(perPage).skip(skip);
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
        const joiVal = joiFunction(req.body, changeUserStatus);
        if (joiVal) throw joiVal;
        let productStatus;
        if (req.body.status === 'active') productStatus = 'active';
        else productStatus = 'hide';
        const result = await user.findOneAndUpdate({ _id: req.body.id }, { $set: { status: req.body.status } });
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