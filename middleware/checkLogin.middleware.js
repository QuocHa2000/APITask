const jwt = require('jsonwebtoken');
const user = require('../models/user.model');
const { authToken } = require('../utils/auth-token');

module.exports = async function(req, res, next) {
    try {
        const foundUser = await authToken(req.headers);
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