const express = require('express');
const route = express.Router();
const controller = require('./order.controller');
const loginMiddleware = require('../../middleware/checklogin.middleware');
const {
    purchaseProductMiddleware,
    buyerChangeOrderStatusMiddleware,
    sellerChangeOrderStatusMiddleware,
    getMyOrderMiddleware
} = require('./order.middleware');

route.post(
    '/sellerchangeorderstatus',
    loginMiddleware,
    sellerChangeOrderStatusMiddleware,
    controller.sellerChangeOrderStatus
);
route.post(
    '/buyerchangeorderstatus',
    loginMiddleware,
    buyerChangeOrderStatusMiddleware,
    controller.buyerChangeOrderStatus
);
route.get(
    '/purchaseproduct',
    loginMiddleware,
    purchaseProductMiddleware,
    controller.purchaseProduct);
route.post(
    '/myorder',
    loginMiddleware,
    getMyOrderMiddleware,
    controller.getMyOrder);

module.exports = route;