const express = require('express');
const route = express.Router();
const controller = require('../controllers/product.controller');
const enterpriseVerify = require('../middleware/enterprise.middleware');
const loginVerify = require('../middleware/checkLogin.middleware');


route.get('/', controller.getProduct);
route.post('/', enterpriseVerify, controller.postProduct);
route.get('/productdetail/:id', controller.productDetail);
route.get('/myproduct', enterpriseVerify, controller.getMyProduct);
route.get('/removeproduct/:id', enterpriseVerify, controller.removeProduct);
route.get('/findproduct', controller.findProduct);
route.post('/updateproduct/:id', enterpriseVerify, controller.updateProduct);

module.exports = route;