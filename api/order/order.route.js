const express = require('express');
const route = express.Router();
const controller = require('./order.controller');
const loginMiddleware = require('../../middleware/checkLogin.middleware');

route.post(
    '/sellerchangeorderstatus',
    loginMiddleware,
    controller.sellerChangeOrderStatus
);
route.post(
    '/buyerchangeorderstatus',
    loginMiddleware,
    controller.buyerChangeOrderStatus
);
route.get('/purchaseproduct', loginMiddleware, controller.purchaseProduct);
route.post('/myorder', loginMiddleware, controller.getMyOrder);

module.exports = route;