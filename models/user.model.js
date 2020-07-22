const mongoose = require('mongoose');
const { number } = require('joi');

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
    cart: [
        // { type: mongoose.Schema.Types.ObjectId, ref: 'product' }
        {
            _id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'product',
                required: true
            },
            amount: {
                type: Number,
                required: true
            }
        }
    ]
});

const User = mongoose.model('users', userSchema, 'users');

module.exports = User;