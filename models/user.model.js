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
    cart: [cartSchema],
    avatar: {
        type: String
    }
}, { toJSON: { virtuals: true } });

cartSchema.virtual('totalPrice').get(function() {
    return this.amount * this.productDetail.sellPrice;
})

const User = mongoose.model('users', userSchema, 'users');

module.exports = User;