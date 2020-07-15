const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    email: String,
    password: String,
    role: String,
    name: String,
    phone: String,
    active: Boolean,
    status: String
});

const User = mongoose.model('User', userSchema, 'users');

module.exports = User;