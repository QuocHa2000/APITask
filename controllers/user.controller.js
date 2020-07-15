const user = require('../model/user.model');

module.exports.getUsers = async function(req, res) {
    try {
        const users = await user.find((err, result) => {
            if (err) throw new Error(err.message)
            else {
                res.json({
                    code: 0,
                    data: result,
                    message: "get all user successful"
                })
            }
        });
    } catch (error) {
        res.json({
            error: error
        })
    }
}

module.exports.changeUserStatus = async function(req, res) {
    try {
        const userId = req.params.id;
        await user.findOneAndUpdate({ _id: userId }, { $set: { status: "block" } }, async(err, result) => {
            if (err) throw new Error(err.message)
            else {
                if (result.status == 'active') await user.findOneAndUpdate({ _id: userId }, { $set: { status: "block" } },
                    (err, result) => {
                        if (err) throw new Error(err.message);
                    });
                else {
                    await user.findOneAndUpdate({ _id: userId }, { $set: { status: "active" } }, (err, result) => {
                        if (err) throw new Error(err.message);
                    })
                }
                res.json({
                    code: 0,
                    message: "Update status successful",
                    data: result
                })

            }
        })


    } catch (err) {
        res.json({
            message: err.message
        })
    }
}