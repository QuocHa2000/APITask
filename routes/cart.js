const express = require('express');
const route = express.Router();
const controller = require('../controllers/cart.controller');
const authEnterprise = require('../middleware/enterprise.middleware');


route.post('/:id', controller.addToCart);
route.get('/', controller.getCart);
route.get('/remove/:id', controller.removeProduct);

module.exports = route;