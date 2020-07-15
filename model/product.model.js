const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    owner: String,
    name: String,
    price: Number,
    description: String,
    status: String
})

const Product = mongoose.model('Product', productSchema, 'product');

module.exports = Product;