const express = require('express');
const route = express.Router();
const controller = require('./statistic.controller');
const checkEnterprise = require('../../middleware/enterprise.middleware');
const checkAdmin = require('../../middleware/checkadmin.middleware');

const adminRoute = express.Router();
const enterpriseRoute = express.Router();

adminRoute.get('/product', controller.productStatisticForAdmin);
adminRoute.get('/member', controller.memberStatisticForAdmin);
adminRoute.get('/revenue', controller.revenueStatisticForAdmin);
adminRoute.get('/order', controller.orderStatisticForAdmin);

enterpriseRoute.get(
    '/product',
    checkEnterprise,
    controller.productStatisticForEnterprise
);
enterpriseRoute.get(
    '/revenue',
    checkEnterprise,
    controller.revenueStatisticForEnterprise
);
enterpriseRoute.get(
    '/order',
    checkEnterprise,
    controller.orderStatisticForEnterprise
);

route.use('/admin', checkAdmin, adminRoute);
route.use('/enterprise', checkEnterprise, enterpriseRoute);

module.exports = route;