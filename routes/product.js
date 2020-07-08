const express = require('express');
const route = express.Router();
const product = require('../modal/product.modal');
const enterpriseVerify = require('../middleware/enterprise.middleware');
const user = require('../modal/user.modal');

route.get('/', function(req, res) {
    product.find(function(error, result) {
        if (error) res.json(error);
        else res.json(result);
    })
})

route.post('/', enterpriseVerify, async function(req, res) {
    let role;
    await user.findOne({ email: req.user.email }, function(err, result) {
        if (result) role = result['role'];
    });

    if (role != 'enterprise') return res.status(403).send('You are not allowed to access');
    if (!req.body.name) {
        return res.status(400).send("Name of product is required");
    }
    if (!req.body.price) {
        return res.status(400).send("Price of product is required");
    }

    let newProduct = await product.create(req.body);

    res.json(newProduct);

})
module.exports = route;