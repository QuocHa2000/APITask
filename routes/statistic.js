const express = require('express');
const route = express.Router();
const controller = require('../controllers/statistic.controller');
const checkEnterprise = require('../middleware/enterprise.middleware');
const checkAdmin = require('../middleware/checkadmin.middleware');

route.get('/admin/product', checkAdmin, controller.productStatisticForAdmin);
route.get('/admin/member', checkAdmin, controller.memberStatisticForAdmin);
route.get('/admin/revenue', checkAdmin, controller.revenueStatisticForAdmin);
route.get('/admin/order', checkAdmin, controller.orderStatisticForAdmin);

route.get('/enterprise/product', checkEnterprise, controller.productStatisticForEnterprise);
route.get('/enterprise/revenue', checkEnterprise, controller.revenueStatisticForEnterprise);
route.get('/enterprise/order', checkEnterprise, controller.orderStatisticForEnterprise);


module.exports = route;