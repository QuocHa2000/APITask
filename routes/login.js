let express = require('express');
let router = express.Router();

const user = require('../modal/user.modal');
const { use } = require('./register');
const bcrypt = require('bcryptjs');


router.post('/', async function(req, res, next) {
    const userEmail = await user.findOne({ email: req.body.email });
    if (!userEmail) {
        res.status(400).send("User name or password is incorrect");
        return;
    }
    const userPassword = await bcrypt.compare(req.body.password, userEmail.password);
    if (!userPassword) {
        res.status(400).send("Username or password is incorrect");
        return;
    }
    res.send("You are login");
})

module.exports = router;