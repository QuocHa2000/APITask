let express = require('express');
let router = express.Router();
let user = require('../modal/user.modal');
const { db } = require('../modal/user.modal');
let bcrypt = require('bcryptjs');


router.get('/', function(req, res) {
    res.send("Can connect");
})
router.post('/', async function(req, res, next) {

    let salt = await bcrypt.genSalt(10);
    let hashPassword = await bcrypt.hash(req.body.password, salt);

    let existEmail = await user.findOne({ email: req.body.email });
    if (existEmail) {
        res.status(400).send("Email is exists");
        return;
    }
    let newuser = await user.insertMany([{
        email: req.body.email,
        password: hashPassword,
        name: req.body.name,
        phone: req.body.phone
    }]);
    // let newuser = await user.create(req.body);
    res.json(newuser);
})

module.exports = router;