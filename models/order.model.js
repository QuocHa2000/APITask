const mongoose = require('mongoose');
const productSchema = mongoose.Schema({
    product: {
        type: Object,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    sellPrice: {
        type: Number,
        required: true
    },
    totalProductPrice: {
        type: Number,
        required: true
    }
})
const orderSchema = mongoose.Schema({
    products: [productSchema],
    buyer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'users'
    },
    status: {
        type: String,
        required: true
    }
}, { toJSON: { virtuals: true } });

orderSchema.virtual('totalPrice').get(function() {
    let totalPrice = 0;
    for (product of this.products) {
        totalPrice += product.totalProductPrice;
    }
    return totalPrice;
})

const orderDetail = mongoose.model('orderDetail', orderSchema, 'orderDetail');
module.exports = orderDetail;