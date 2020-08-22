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
    totalPriceOfProduct: {
        type: Number
    }
}, { toJSON: { virtuals: true }, toObject: { virtuals: true } })
const orderSchema = mongoose.Schema({
    products: [productSchema],
    buyer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true,
        index: true
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'users',
        index: true
    },
    status: {
        type: String,
        required: true
    }
}, { toJSON: { virtuals: true }, toObject: { virtuals: true } });
orderSchema.virtual('totalCost').get(function() {
    let totalCost = 0;
    for (product of this.products) {
        totalCost += product.totalPriceOfProduct;
    }
    return totalCost;
})

const orderDetail = mongoose.model('orderDetail', orderSchema, 'orderDetail');
module.exports = orderDetail;