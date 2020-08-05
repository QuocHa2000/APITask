const express = require('express');
const route = express.Router();
const controller = require('../controllers/cart.controller');

route.post('/', controller.addToCart);
route.get('/', controller.getCart);
route.post('/removeproduct', controller.removeProduct);
route.post('/changepickproduct', controller.changePickProduct);
route.post('/changepick/all', controller.changePickAll);
route.post('/updateproduct', controller.updateProduct);

module.exports = route;