const product = require('../model/product.model');
const user = require('../model/user.model');
const Joi = require('joi');
const { checkProductSchema } = require('./checkInput');
const jwt = require('jsonwebtoken');


module.exports.getProduct = function(req, res) {
    product.find(function(error, result) {
        if (error) res.json(error);
        else res.json(result);
    })
}

module.exports.getMyProduct = function(req, res) {
    const authHeader = req.headers['authorization'];
    const token = authHeader.split(' ')[1];
    const checkUser = jwt.verify(token, process.env.secret_key);

    product.find({ owner: checkUser.email }, (err, result) => {
        if (err) throw new Error(err.message);
        else res.json({
            result
        })
    })

}

module.exports.postProduct = async function(req, res) {

    try {

        Joi.validate(req.body, checkProductSchema, (err, result) => {
            if (err) throw new Error(err.message);
        })
        if (!req.body.name) {
            throw new Error('Name of product is required');
        }
        if (!req.body.price) {
            throw new Error('Price of product is required');
        }

        let newProduct = await product.create({
            owner: req.user.email,
            name: req.body.name,
            price: req.body.price
        });

        res.json({
            code: 0,
            data: newProduct,
            message: 'Post product success'
        });
    } catch (err) {
        res.json({
            message: err.message
        })
    }
}