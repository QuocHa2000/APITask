const mongoose = require('mongoose');

const cartSchema = mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'product',
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    pick: {
        type: Boolean,
        required: true,
    },
}, { toJSON: { virtuals: true }, toObject: { virtuals: true } });

const userSchema = mongoose.Schema({
    email: {
        type: String,
        index: { text: true },
        unique: true,
        required: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
        index: { text: true },
    },
    phone: {
        type: String,
        required: true,
    },
    active: {
        type: Boolean,
        required: true,
    },
    status: {
        type: String,
        required: true,
    },
    cart: { default: [], type: [cartSchema] },
    avatar: {
        type: String,
    },
}, { toJSON: { virtuals: true }, toObject: { virtuals: true }, id: false });

cartSchema.virtual('totalPriceOfProduct').get(function() {
    return this.amount * this.productId.salePrice;
});
userSchema.virtual('totalCost').get(function() {
    let totalMoney = 0;
    if (!this.cart) return;
    for (let product of this.cart) {
        if (product.pick === true) totalMoney += product.totalPriceOfProduct;
    }
    return totalMoney;
});

const User = mongoose.model('users', userSchema, 'users');

module.exports = User;