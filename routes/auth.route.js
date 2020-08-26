const express = require('express');
const route = express.Router();
const controller = require('../controllers/auth.controller');

route.post('/login', controller.login);
route.post('/register', controller.register);
route.post('/verify/:email', controller.verify);
route.get('/verify/resendmail/:email', controller.resendMail);

module.exports = route;