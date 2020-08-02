const product = require('../models/product.model');
const user = require('../models/user.model');
const Joi = require('joi');
const { checkProductSchema } = require('../validate/product.validate');
const jwt = require('jsonwebtoken');


module.exports.findProduct = async function(req, res) {
    try {
        const page = req.query.page || 1;
        const perPage = 8;
        let skip = (page - 1) * perPage;
        // const foundProduct = await product.find({ name: new RegExp(req.query.productName, 'i') })
        const foundProduct = await product.find({ $text: { $search: req.query.productName } }, { score: { $meta: 'textScore' } })
            .sort({ score: { $meta: 'textScore' } })
            .populate({ path: 'owner', select: { 'email': 1, 'phone': 1, 'status': 1, 'role': 1 } })
            .limit(perPage)
            .skip(skip);
        res.json({
            code: 0,
            message: "Find product successfully",
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
        const result = await product.find({ status: "active" })
            .populate({ path: 'owner', select: { 'email': 1, 'phone': 1, 'status': 1, 'role': 1 } })
            .limit(perPage)
            .skip(skip);
        res.json({
            code: 0,
            message: "Get product successfully",
            data: result
        });
    } catch (error) {
        res.json(error)
    }
}

module.exports.productDetail = async function(req, res) {
    try {
        const result = await product.findOne({ _id: req.params.id });
        res.json({
            code: 0,
            message: "Get product detail successfully",
            data: result
        })
    } catch (error) {
        res.json(error)
    }
}
module.exports.getMyProduct = async function(req, res) {
    try {
        const page = req.query.page || 1;
        const perPage = 8;
        let skip = (page - 1) * perPage;
        const result = await product.find({ owner: req.user._id })
            .populate({ path: 'owner', select: { 'email': 1, 'phone': 1, 'status': 1, 'role': 1 } })
            .limit(perPage)
            .skip(skip);
        res.json({
            code: 0,
            message: "Get my products successfully",
            data: result
        });
    } catch (err) {
        res.json(err)
    }
}

module.exports.updateProduct = async function(req, res) {
    try {
        const joiVal = Joi.validate(req.body, checkProductSchema);
        if (joiVal.error) {
            throw {
                code: 1,
                message: joiVal.error.message,
                data: "Invalid"
            }
        }
        const result = await product.findOneAndUpdate({ _id: productId, owner: req.user._id }, { $set: req.body });
        res.json({
            code: 0,
            message: " Update product successfully",
            data: result
        })
    } catch (err) {
        res.json(err)
    }
}

module.exports.removeProduct = async function(req, res) {
    try {
        const result = await product.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
        res.json({
            code: 0,
            message: 'Delete product successfully',
            data: result
        })
    } catch (err) {
        res.json(err)
    }
}

module.exports.postProduct = async function(req, res) {

    try {
        const joiVal = Joi.validate(req.body, checkProductSchema);
        if (joiVal.error) {
            throw {
                code: 1,
                message: joiVal.error.message,
                data: "Invalid"
            }
        }
        const newProduct = await product.create({
            owner: req.user._id,
            name: req.body.name,
            price: req.body.price,
            status: req.body.status,
            sold: 0,
            amount: req.body.amount,
            discount: req.body.discount
        });
        res.json({
            code: 0,
            data: newProduct,
            message: 'Post product successfully'
        });
    } catch (err) {
        res.json(err);
    }
}