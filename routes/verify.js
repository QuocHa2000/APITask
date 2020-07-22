const express = require('express');
const route = express.Router();
const controller = require('../controllers/auth.controller');

route.post('/:email', controller.verify);
route.get('/resendmail/:email', controller.resendMail);

module.exports = route;