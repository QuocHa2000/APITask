const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true,
    },
    name: {
        type: String,
        index: { 'text': true },
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        index: { 'text': true }
    },
    status: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    }
})

const Product = mongoose.model('product', productSchema, 'product');

module.exports = Product;