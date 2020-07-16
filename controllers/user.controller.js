const user = require('../model/user.model');
const product = require('../model/product.model');

module.exports.getUsers = async function(req, res) {
    try {
        const result = await user.find();
        res.json({
            code: 0,
            data: result,
            message: "Get all user successful"
        })
    } catch (error) {
        res.json({
            error: error
        })
    }
}

module.exports.changeUserStatus = async function(req, res) {
    try {
        const needUpdateUser = await user.findOne({ _id: req.params.id });
        let productStatus;
        if (req.body.status === 'active') productStatus = 'active';
        else productStatus = 'hide';
        const result = await user.findOneAndUpdate({ _id: req.params.id }, { $set: { status: req.body.status } });
        await product.updateMany({ owner: needUpdateUser.email }, { $set: { status: productStatus } });
        res.json({
            code: 0,
            message: "Change status successful",
            data: result
        })
    } catch (err) {
        res.json({
            message: err.message
        })
    }
}