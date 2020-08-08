const jwt = require('jsonwebtoken');
const user = require('../models/user.model');

module.exports = async function(req, res, next) {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader.split(' ')[1];
        if (!token) throw { message: "You are not login" };
        let role;
        let status;
        // Kiểm tra có phải vai trò là enterprise hay không
        const verify = jwt.verify(token, process.env.secret_key);
        const checkUser = await user.findOne({ email: verify.email }, function(err, result) {
            if (result) {
                role = result['role'];
                status = result['status'];
            }
        });

        if (role !== 'enterprise' || status !== 'active') throw { message: 'You are not allowed to access' };
        req.user = checkUser;
        next();
    } catch (error) {
        res.json({
            code: 1,
            message: error.message,
            data: "Error"
        })
    }
}