const jwt = require('jsonwebtoken');
const user = require('../models/user.model');

module.exports.authToken = async function(headers) {
    try {
        const authHeader = headers['authorization'];
        if (!authHeader) throw new Error('You are not login');
        const token = authHeader.split(' ')[1];
        if (!token) throw new Error('You are not login');
        const loginUser = await jwt.verify(token, process.env.secret_key);
        const foundUser = await user.findOne({ email: loginUser.email });
        return foundUser;
    } catch (error) {
        res.json({
            code: 1,
            message: error.message,
            data: 'Error',
        });
    }
};