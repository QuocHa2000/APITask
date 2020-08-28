const express = require('express');
const route = express.Router();
const controller = require('./auth.controller');
const {
    loginMiddleware,
    registerMiddleware,
    verifyMiddleware,
    resendMailMiddleware
} = require('./auth.middleware');

route.post('/login', loginMiddleware, controller.login);
route.post('/register', registerMiddleware, controller.register);
route.post('/verify/:email', verifyMiddleware, controller.verify);
route.get('/verify/resendmail/:email', resendMailMiddleware, controller.resendMail);

module.exports = route;