const jwt = require('jsonwebtoken');
const userService = require('../api/user/user.service');

module.exports.authToken = async function(headers) {
    try {
        const authHeader = headers['Authorization'];
        if (!authHeader) throw new Error('You are not login');
        const token = authHeader.split(' ')[1];
        if (!token) throw new Error('You are not login');
        const loginUser = await jwt.verify(token, process.env.secret_key);
        const foundUser = await userService.getOne({ email: loginUser.email });
        return foundUser;
    } catch (error) {
        return ({
            code: 1,
            message: error.message,
            data: 'Error',
        });
    }
};