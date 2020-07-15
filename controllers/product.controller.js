const product = require('../model/product.model');
const user = require('../model/user.model');
const Joi = require('joi');
const { checkProductSchema } = require('./checkInput');
const jwt = require('jsonwebtoken');


module.exports.getProduct = function(req, res) {
    product.find({ status: "active" }, function(error, result) {
        if (error) res.json(error);
        else res.json(result);
    })
}

module.exports.getMyProduct = async function(req, res) {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader.split(' ')[1];
        const checkUser = await jwt.verify(token, process.env.secret_key);
        await product.find({ owner: checkUser.email }, (err, result) => {
            if (err) throw new Error(err.message);
            else res.json({
                result
            })
        })
    } catch (err) {
        res.json({
            message: err.message
        })
    }

}

module.exports.changeStatusProduct = async function(req, res) {
    try {
        const productId = req.params.id;
        const authHeader = req.headers['authorization'];
        const token = authHeader.split(' ')[1];
        const owner = await jwt.verify(token, process.env.secret_key);

        const check = await product.findOne({ _id: productId, owner: owner.email });
        if (!check) throw new Error('You are not allowed to access');

        await product.findOne({ _id: productId, owner: owner.email }, async(err, result) => {
            if (err) throw new Error(err.message)
            else {
                if (result.status == 'active') {
                    await product.findOneAndUpdate({ _id: result._id }, { $set: { status: 'hide' } }, (err, result) => {
                        if (err) throw new Error(err.message);
                    })
                } else await product.findOneAndUpdate({ _id: result._id }, { $set: { status: 'active' } })
                res.json({
                    code: 0,
                    message: " Change status successful",
                    data: result
                })
            }
        })

        // await product.findOneAndUpdate({ _id: productId, owner: owner.email }, { status: 'hide' }, (err, result) => {
        //     if (err) throw new Error(err.message)
        //     else res.json({
        //         code: 0,
        //         message: "Hide product successful",
        //         data: result
        //     })
        // })
    } catch (err) {
        res.json({
            message: err.message
        })
    }
}



module.exports.updateProduct = async function(req, res) {
    try {
        const productId = req.params.id;
        const authHeader = req.headers['authorization'];
        const token = authHeader.split(' ')[1];
        const owner = await jwt.verify(token, process.env.secret_key);

        const check = await product.findOne({ _id: productId, owner: owner.email });
        if (!check) throw new Error('You are not allowed to access');

        await product.findOneAndUpdate({ _id: productId, owner: owner.email }, { $set: req.body }, (err, result) => {
            if (err) throw new Error(err.message)
            else res.json({
                code: 0,
                message: " Update successful",
                data: result
            })
        })
    } catch (err) {
        res.json({
            message: err.message
        })
    }
}

module.exports.removeProduct = async function(req, res) {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader.split(' ')[1];
        const owner = await jwt.verify(token, process.env.secret_key);
        const productId = req.params.id;

        const check = await product.findOne({ _id: productId, owner: owner.email });
        if (!check) throw new Error('You are not allowed to access');

        await product.findOneAndDelete({
            _id: productId,
            owner: owner.email
        }, (err, result) => {
            if (err) throw new Error(err.message)
            else res.json({
                code: 0,
                message: 'Delete successful',
                data: result
            })
        });

    } catch (err) {
        res.json({
            message: err.message
        })
    }

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
            price: req.body.price,
            status: 'active'
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