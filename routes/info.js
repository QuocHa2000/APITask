const express = require('express');
const route = express.Router();
const controller = require('../controllers/info.controller');

route.get('/myinfo', controller.getMyInfo);
route.post('/updateinfo', controller.updateInfo);
route.post('/changepassword', controller.changePassword)

module.exports = route;