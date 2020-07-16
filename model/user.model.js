const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    email: {
        type: String,
        index: true,
        unique: true,
        required: true
    },
    password: String,
    role: String,
    name: String,
    phone: String,
    active: Boolean,
    status: String
});

const User = mongoose.model('users', userSchema, 'users');

module.exports = User;