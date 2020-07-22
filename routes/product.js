const express = require('express');
const route = express.Router();
const controller = require('../controllers/product.controller');
const enterpriseVerify = require('../middleware/enterprise.middleware');
const loginVerify = require('../middleware/checkLogin.middleware');


route.get('/', controller.getProduct);
route.post('/', enterpriseVerify, controller.postProduct);
route.get('/myproduct', loginVerify, controller.getMyProduct);
route.get('/removeproduct/:id', loginVerify, controller.removeProduct);
route.get('/findproduct', controller.findProduct);
route.post('/updateproduct/:id', loginVerify, controller.updateProduct);
route.get('/finishorder/:id', function(req, res) {
    res.send(req.params.id);
})

module.exports = route;