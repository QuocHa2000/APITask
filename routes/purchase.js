const express = require('express');
const route = express.Router();
const controller = require('../controllers/purchase.controller');
const authEnterprise = require('../middleware/enterprise.middleware');
const loginMiddleware = require('../middleware/checkLogin.middleware');

route.get('/mysellingorder', authEnterprise, controller.mySellingOrder);
route.post('/mybuyingorder', loginMiddleware, controller.myBuyingOrder);
route.post('/confirmorder', authEnterprise, controller.confirmOrder);
route.post('/gettingorder', authEnterprise, controller.gettingOrder);
route.post('/finishorder', loginMiddleware, controller.finishOrder);
route.get('/purchaseproduct', loginMiddleware, controller.purchaseProduct);
route.post('/cancelorder', loginMiddleware, controller.cancelOrder);

module.exports = route;