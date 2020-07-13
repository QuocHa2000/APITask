const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    email: String,
    password: String,
    role: String,
    name: String,
    phone: String,
    active: Boolean
});

const User = mongoose.model('User', userSchema, 'users');

module.exports = User;