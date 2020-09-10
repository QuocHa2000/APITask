const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true,
    },
    name: {
        type: String,
        index: { text: true },
        required: true,
    },
    price: {
        type: Number,
        required: true,
        min: 0,
    },
    description: {
        type: String
    },
    status: {
        type: String,
        required: true,
    },
    sold: {
        type: Number,
        required: true,
        min: 0,
    },
    quantity: {
        type: Number,
        required: true,
        min: 0,
    },
    discount: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
    },
    productImage: [{
        type: String,
    }, ],
}, { toJSON: { virtuals: true }, toObject: { virtuals: true } });

productSchema.virtual('salePrice').get(function() {
    return (this.price * (100 - this.discount)) / 100;
});
const Product = mongoose.model('product', productSchema, 'product');

module.exports = Product;