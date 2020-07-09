const jwt = require('jsonwebtoken');
const user = require('../modal/user.modal');

module.exports = function(req, res, next) {
    let token = req.header('auth-token');
    if (!token) {
        res.status(400).send('You haven\'t login yet');
        return;
    }
    try {
        // Kiểm tra có phải vai trò là enterprise hay không
        let verify = jwt.verify(token, process.env.secret_key);
        req.user = verify;
        console.log(verify);
        next();
    } catch (error) {
        res.status(400).send(error);
    }
}