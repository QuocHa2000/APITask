const express = require('express');
const route = express.Router();
const controller = require('../controllers/purchase.controller');
const authEnterprise = require('../middleware/enterprise.middleware');
const loginMiddleware = require('../middleware/checkLogin.middleware');

route.post('/changeorderstatus', loginMiddleware, controller.changeOrderStatus);
route.get('/purchaseproduct', loginMiddleware, controller.purchaseProduct);
route.post('/myorder', loginMiddleware, controller.myOrder)

module.exports = route;