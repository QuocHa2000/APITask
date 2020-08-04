const express = require('express');
const route = express.Router();
const controller = require('../controllers/cart.controller');
const authEnterprise = require('../middleware/enterprise.middleware');


route.post('/:id', controller.addToCart);
route.get('/', controller.getCart);
route.get('/remove/:id', controller.removeProduct);
route.get('/changepickproduct/:id', controller.changePickProduct);
route.post('/changepick/all', controller.changePickAll);
route.post('/updateproduct/:id', controller.updateProduct);

module.exports = route;