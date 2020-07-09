const express = require('express');
const route = express.Router();
const user = require('../modal/user.modal');
const jwt = require('jsonwebtoken');

route.post('/', async function(req, res, next) {
    // Kích hoạt tài khoản đúng email
    let token = await jwt.verify(req.body.token.trim(), process.env.secret_key);
    console.log(token);

    await user.findOneAndUpdate({ email: token.userEmail }, { active: true }, (err, result) => {
            if (err) return res.status(400).send(err);
            else res.json(result);
        })
        // await user.findOne({ email: token.userEmail }, (err, result) => {
        //     if (err) {
        //         return res.send(err);
        //     }
        //     if (result) {
        //         result.active = true;
        //         console.log(result);
        //         res.json(result);
        //     }
        // })
})

module.exports = route;