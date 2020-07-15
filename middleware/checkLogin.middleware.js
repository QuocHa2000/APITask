const jwt = require('jsonwebtoken');
const user = require('../model/user.model');

module.exports = async function(req, res, next) {
    try {
        const authHeader = req.headers['authorization'];
        if (!authHeader) throw new Error('You are not login');
        const token = authHeader.split(" ")[1];
        if (!token) throw new Error('You are not login');
        const loginUser = await jwt.verify(token, process.env.secret_key);
        req.user = loginUser;
        next()
    } catch (error) {
        res.json({
            message: error.message
        });
    }


}