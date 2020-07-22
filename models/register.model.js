const mongoose = require('mongoose');

const registerSchema = mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: true
    },
    authCode: {
        type: Number,
        required: true
    },
    createdAt: { type: Date, index: { expireAfterSeconds: 3600 } }
})

const register = mongoose.model('register', registerSchema, 'register');

module.exports = register;