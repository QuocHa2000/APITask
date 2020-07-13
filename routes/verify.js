const express = require('express');
const route = express.Router();
const controller = require('../controllers/verify.controller');

route.post('/:email', controller.verify);

module.exports = route;