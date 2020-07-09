let express = require('express');
let router = express.Router();

const user = require('../modal/user.modal');
const { use } = require('./register');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

router.get('/', function(req, res) {
    res.send('hello');
})

router.post('/', async function(req, res, next) {
    const userEmail = await user.findOne({ email: req.body.email });
    if (!userEmail) {
        res.status(400).send("User name or password is incorrect");
        return;
    }
    // Kiểm tra tài khoản đã được activated chưa 
    if (userEmail.active == false) {
        return res.status(404).send("Your account is not actived");
    }
    const userPassword = await bcrypt.compare(req.body.password, userEmail.password);
    if (!userPassword) {
        res.status(400).send("Username or password is incorrect");
        return;
    } else {
        let token = await jwt.sign({
            email: userEmail.email,
            userId: userEmail._id
        }, process.env.secret_key);
        await res.header('auth-token', token);
        res.json({
            message: "You are login",
            token: token
        })
    }

})

module.exports = router;