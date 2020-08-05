const product = require('../models/product.model');
const user = require('../models/user.model');
const Joi = require('joi');
const { checkProductSchema } = require('../validate/product.validate');
const jwt = require('jsonwebtoken');
const { joiFunction } = require('../utils/joival');

module.exports.findProduct = async function(req, res) {
    try {
        const page = req.query.page || 1;
        const perPage = 8;
        let skip = (page - 1) * perPage;
        const foundProduct = await product.find({ $text: { $search: req.query.productName } }, { score: { $meta: 'textScore' } })
            .sort({ score: { $meta: 'textScore' } })
            .populate({ path: 'owner', select: { 'email': 1, 'phone': 1, 'status': 1, 'role': 1 } })
            .limit(perPage)
            .skip(skip);
        res.json({
            code: 0,
            message: "Find product successfully",
            data: foundProduct,
            totalPage: Math.ceil(foundProduct.length / perPage)
        })
    } catch (error) {
        res.json({
            code: 1,
            message: error.message,
            data: "Error"
        });;
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
        res.json({
            code: 1,
            message: error.message,
            data: "Error"
        });
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
        res.json({
            code: 1,
            message: error.message,
            data: "Error"
        });
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
            data: result,
            totalPage: Math.ceil(result.length / perPage)
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
        let productImage = [];
        for (file of req.files) {
            productImage.push(file.path.replace(/\\/g, '/'));
        }
        const result = await product.findOneAndUpdate({ _id: req.params.id, owner: req.user._id }, { $set: req.body, productImage });
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
        const joiVal = joiFunction(req.body, checkProductSchema);
        if (joiVal) throw joiVal;
        let productImage = [];
        for (file of req.files) {
            productImage.push(file.path.replace(/\\/g, '/'));
        }
        const newProduct = await product.create({
            owner: req.user._id,
            name: req.body.name,
            price: req.body.price,
            status: req.body.status,
            sold: 0,
            amount: req.body.amount,
            discount: req.body.discount,
            productImage: productImage
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