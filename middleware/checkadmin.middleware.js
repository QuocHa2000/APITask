const jwt = require('jsonwebtoken');
const user = require('../model/user.model');

module.exports = async function(req, res, next) {
    try {
        const authHeader = req.headers['authorization'];
        if (!authHeader) throw { code: 403, message: "You are not login" };
        const token = authHeader.split(" ")[1];
        if (!token) throw { code: 403, message: "You are not login" };
        const loginUser = await jwt.verify(token, process.env.secret_key);
        let role = "";
        const foundUser = await user.findOne({ email: loginUser.email });
        if (foundUser.role != 'admin') throw { code: 403, message: "You are not allowed to access" };
        next()
    } catch (error) {
        res.json(error);
    }


}