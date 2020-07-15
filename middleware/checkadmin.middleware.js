const jwt = require('jsonwebtoken');
const user = require('../model/user.model');

module.exports = async function(req, res, next) {
    try {
        const authHeader = req.headers['authorization'];
        if (!authHeader) throw new Error('You are not login');
        const token = authHeader.split(" ")[1];
        if (!token) throw new Error('You are not login');
        const loginUser = await jwt.verify(token, process.env.secret_key);
        let role = "";
        await user.findOne({ email: loginUser.email }, (err, result) => {
            if (err) throw new Error(err.message);
            else {
                role = result['role']
            }
        })
        if (role != 'admin') throw new Error('You are not allowed to access');
        next()
    } catch (error) {
        res.json({
            message: error.message
        });
    }


}