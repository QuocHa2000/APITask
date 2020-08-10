const express = require('express');
const route = express.Router();
const controller = require('../controllers/cart.controller');

route.post('/changeincart', controller.changeInCart);
route.get('/', controller.myCart);
route.post('/changepickproduct', controller.changePickProduct);


module.exports = route;