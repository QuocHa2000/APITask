const express = require('express');
const route = express.Router();
const controller = require('../controllers/cart.controller');

route.post('/changeproductsincart', controller.changeProductsInCart);
route.get('/', controller.getMyCart);
route.post('/changepickproduct', controller.pickProduct);

module.exports = route;
