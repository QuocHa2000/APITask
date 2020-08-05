const mongoose = require('mongoose');

const cartSchema = mongoose.Schema({
    productDetail: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'product',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    pick: {
        type: Boolean,
        required: true
    }
}, { toJSON: { virtuals: true } })

const userSchema = mongoose.Schema({
    email: {
        type: String,
        index: true,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: String,
    name: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    active: {
        type: Boolean,
        required: true
    },
    status: {
        type: String,
        required: true
    },
    cart: { default: [], type: [cartSchema] },
    avatar: {
        type: String
    }
}, { toJSON: { virtuals: true } });

cartSchema.virtual('totalPrice').get(function() {
    return this.amount * this.productDetail.sellPrice;
})
userSchema.virtual('total').get(function() {
    let totalMoney = 0;
    if (!this.cart) return;
    for (product of this.cart) {
        if (product.pick === true) totalMoney += product.totalPrice;
    }
    return totalMoney;
})

const User = mongoose.model('users', userSchema, 'users');

module.exports = User;