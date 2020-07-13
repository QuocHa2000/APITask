const express = require('express');
const route = express.Router();
const controller = require('../controllers/product.controller');
const enterpriseVerify = require('../middleware/enterprise.middleware');


route.get('/', controller.getProduct);
route.post('/', enterpriseVerify, controller.postProduct);
route.get('/myproduct', controller.getMyProduct);

module.exports = route;