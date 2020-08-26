const jwt = require('jsonwebtoken');
const user = require('../models/user.model');

module.exports = async function (req, res, next) {
    try {
        const authHeader = req.headers['authorization'];
        if (!authHeader) throw { message: 'You are not login' };
        const token = authHeader.split(' ')[1];
        if (!token) throw { message: 'You are not login' };
        const loginUser = await jwt.verify(token, process.env.secret_key);
        const foundUser = await user.findOne({ _id: loginUser.userId });
        req.user = foundUser;
        next();
    } catch (error) {
        res.json({
            code: 1,
            message: error.message,
            data: 'Error',
        });
    }
};
