const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    owner: String,
    //  {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'users',
    //     required: true,
    // },
    name: String,
    price: Number,
    description: String,
    status: String
})

const Product = mongoose.model('Product', productSchema, 'product');

module.exports = Product;
// Product.findOne().populate('owner');