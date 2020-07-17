const product = require('../model/product.model');
const user = require('../model/user.model');
const Joi = require('joi');
const { checkProductSchema } = require('./productValidate');
const jwt = require('jsonwebtoken');


module.exports.findProduct = async function(req, res) {
    try {
        const page = req.query.page || 1;
        const perPage = 8;
        let skip = (page - 1) * perPage;
        const foundProduct = await product.find({ name: new RegExp(req.query.productName) }).populate('owner').limit(perPage).skip(skip);
        res.json({
            code: 0,
            message: "Find product success",
            data: foundProduct
        })
    } catch (error) {
        res.json(error);
    }
}

module.exports.getProduct = async function(req, res) {
    try {
        const page = req.query.page || 1;
        const perPage = 8;
        let skip = (page - 1) * perPage;
        const result = await product.find({ status: "active" }).populate('owner').limit(perPage).skip(skip);
        res.json({
            code: 0,
            message: "Get product successfully",
            data: result
        });
    } catch (error) {
        res.json(error)
    }
}

module.exports.getMyProduct = async function(req, res) {
    try {
        const authHeader = req.headers['authorization'];
        if (!authHeader) throw { code: 403, message: "You are not login" };
        const token = authHeader.split(' ')[1];
        const checkUser = await jwt.verify(token, process.env.secret_key);
        const page = req.query.page || 1;
        const perPage = 8;
        let skip = (page - 1) * perPage;
        const result = await product.find({ owner: checkUser.userId }).populate('owner').limit(perPage).skip(skip);
        res.json(result);
    } catch (err) {
        res.json(err)
    }

}

module.exports.changeStatusProduct = async function(req, res) {
    try {
        const productId = req.params.id;
        const authHeader = req.headers['authorization'];
        const token = authHeader.split(' ')[1];
        const owner = await jwt.verify(token, process.env.secret_key);

        const check = await product.findOne({ _id: productId, owner: owner.userId });
        if (!check) throw { code: 403, message: "You are not allowed to access" };
        const result = await product.findOneAndUpdate({ _id: productId, owner: owner.userId }, { $set: { status: req.body.status } });
        res.json({
            code: 0,
            message: 'Change status successful',
            data: result
        })
    } catch (err) {
        res.json(err)
    }
}



module.exports.updateProduct = async function(req, res) {
    try {
        const productId = req.params.id;
        const authHeader = req.headers['authorization'];
        const token = authHeader.split(' ')[1];
        const owner = await jwt.verify(token, process.env.secret_key);

        const check = await product.findOne({ _id: productId, owner: owner.userId });
        if (!check) throw { code: 403, message: "You are not allowed to access" };

        await product.findOneAndUpdate({ _id: productId, owner: owner.userId }, { $set: req.body });
        res.json({
            code: 0,
            message: " Update successful",
            data: result
        })
    } catch (err) {
        res.json(err)
    }
}

module.exports.removeProduct = async function(req, res) {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader.split(' ')[1];
        const owner = await jwt.verify(token, process.env.secret_key);
        const productId = req.params.id;

        const check = await product.findOne({ _id: productId, owner: owner.userid });
        if (!check) throw { code: 403, message: "You are not allowed to access" };

        await product.findOneAndDelete({ _id: productId, owner: owner.userId });
        res.json({
            code: 0,
            message: 'Delete successful',
            data: result
        })

    } catch (err) {
        res.json(err)
    }

}

module.exports.postProduct = async function(req, res) {

    try {
        await Joi.validate(req.body, checkProductSchema);
        if (!req.body.name) {
            throw { code: 401, message: "Name of product is required" };
        }
        if (!req.body.price) {
            throw { code: 401, message: "Price of product is required" };
        }
        const newProduct = await product.create({
            owner: req.user,
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
        res.json(err);
    }
}