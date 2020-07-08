const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    name: String,
    price: Number,
    description: String
})

const Product = mongoose.model('Product', productSchema, 'product');

module.exports = Product;