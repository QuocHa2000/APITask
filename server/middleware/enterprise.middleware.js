const { authToken } = require('../utils/auth-token');

module.exports = async function(req, res, next) {
    try {
        const foundUser = await authToken(req.headers);
        if (foundUser.role !== 'enterprise' || foundUser.status !== 'active') {
            throw new Error('You are not allowed to access');
        }
        req.user = foundUser;
        next();
    } catch (error) {
        res.json({
            code: 1,
            message: error.message,
            data: 'Error',
        });
    }
}