const express = require('express');
const route = express.Router();
const controller = require('../controllers/product.controller');
const enterpriseVerify = require('../middleware/enterprise.middleware');


route.get('/', controller.getProduct);
route.post('/', enterpriseVerify, controller.postProduct);
route.get('/myproduct', controller.getMyProduct);
route.get('/removeproduct/:id', controller.removeProduct);
route.post('/updateproduct/:id', controller.updateProduct);
route.get('/changestatusproduct/:id', controller.changeStatusProduct);

module.exports = route;