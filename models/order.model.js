const mongoose = require('mongoose');
const productSchema = mongoose.Schema({
    product: {
        type: Object,
        required: true
    },
    amount: {
        type: Number,
        required: true
    }
}, { toJSON: { virtuals: true } })
const orderSchema = mongoose.Schema({
    products: [productSchema],
    buyer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'users'
    },
    status: {
        type: String,
        required: true
    }
}, { toJSON: { virtuals: true } });
productSchema.virtual('realPrice').get(function() {
    return this.product.sellPrice * this.amount;
})
orderSchema.virtual('totalPrice').get(function() {
    let totalPrice = 0;
    for (product of this.products) {
        totalPrice += product.realPrice;
    }
    return totalPrice;
})

const orderDetail = mongoose.model('orderDetail', orderSchema, 'orderDetail');
module.exports = orderDetail;