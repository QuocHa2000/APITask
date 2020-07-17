const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true,
    },
    name: {
        type: String,
        index: true,
        required: true
    },
    price: Number,
    description: String,
    status: String
})

const Product = mongoose.model('product', productSchema, 'product');

module.exports = Product;
// Product.findOne().populate('owner');