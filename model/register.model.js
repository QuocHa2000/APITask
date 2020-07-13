const mongoose = require('mongoose');

const registerSchema = mongoose.Schema({
    email: String,
    authCode: Number,
    createdAt: { type: Date, index: { expireAfterSeconds: 3600 } }
})

const register = mongoose.model('register', registerSchema, 'register');

module.exports = register;