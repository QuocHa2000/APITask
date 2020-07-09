let express = require('express');
let router = express.Router();
let user = require('../modal/user.modal');
const { db } = require('../modal/user.modal');
let bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const nodemailerSendgrid = require('nodemailer-sendgrid');
const jwt = require('jsonwebtoken');

router.get('/', function(req, res) {
    res.send("Can connect");
})
router.post('/', async function(req, res, next) {
    if (req.body.email.trim() == '') {
        res.status(400).send("Email is empty");
        return;
    }
    let salt = await bcrypt.genSalt(10);
    let hashPassword = await bcrypt.hash(req.body.password, salt);

    let existEmail = await user.findOne({ email: req.body.email });
    if (existEmail) {
        res.status(400).send("Email is exists");
        return;
    }

    let token = await jwt.sign({
        userEmail: req.body.email
    }, process.env.secret_key);
    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: '18521308@gm.uit.edu.vn', // generated ethereal user
            pass: '1804635309', // generated ethereal password
        },
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
        from: '18521308@gm.uit.edu.vn', // sender address
        to: req.body.email, // list of receivers
        subject: "Hello ✔", // Subject line
        html: `Please click this link to verify your email with token ${token} <a href='http://localhost:4000/verify'>http://localhost:4000/verify</a>`, // html body
    });

    let newuser = await user.insertMany([{
        email: req.body.email,
        password: hashPassword,
        role: req.body.role,
        name: req.body.name,
        phone: req.body.phone,
        active: false
    }]);
    // let newuser = await user.create(req.body);
    // res.json(newuser);
    res.json(newuser);
})

module.exports = router;