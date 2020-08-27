const express = require('express');
const route = express.Router();
const controller = require('../controllers/user.controller');

route.get('/', controller.getUsers);
route.get('/finduser', controller.findUser);
route.post('/changestatus', controller.changeUserStatus);

module.exports = route;