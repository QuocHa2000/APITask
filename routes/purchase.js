const express = require('express');
const route = express.Router();
const controller = require('../controllers/purchase.controller');
const authEnterprise = require('../middleware/enterprise.middleware');
const loginMiddleware = require('../middleware/checkLogin.middleware');

route.get('/mysellingorder', authEnterprise, controller.mySellingOrder);
route.post('/mybuyingorder', loginMiddleware, controller.myBuyingOrder);
route.post('/changeorderstatus', loginMiddleware, controller.changeOrderStatus);
route.get('/purchaseproduct', loginMiddleware, controller.purchaseProduct);

module.exports = route;