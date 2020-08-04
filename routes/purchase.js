const express = require('express');
const route = express.Router();
const controller = require('../controllers/cart.controller');
const authEnterprise = require('../middleware/enterprise.middleware');
const loginMiddleware = require('../middleware/checkLogin.middleware');

route.get('/getorder', authEnterprise, controller.getOrder);
route.get('/myorder', loginMiddleware, controller.myOrder);
route.get('/mycanceledorder', loginMiddleware, controller.myCanceledOrder);
route.get('/confirmorder/:id', authEnterprise, controller.confirmOrder);
route.get('/gettingorder/:id', authEnterprise, controller.gettingOrder);
route.get('/finishorder/:id', loginMiddleware, controller.finishOrder);
route.get('/purchaseproduct', loginMiddleware, controller.purchaseProduct);
route.get('/cancelorder/:id', loginMiddleware, controller.cancelOrder);

module.exports = route;