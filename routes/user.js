const express = require('express');
const route = express.Router();
const controller = require('../controllers/user.controller');

route.get('/', controller.getUsers);
route.post('/changestatus/:id', controller.changeUserStatus);

module.exports = route;