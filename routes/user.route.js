const express = require('express');
const route = express.Router();
const userController = require('../controllers/user.controller');
const cartController = require('../controllers/cart.controller');

const cartRoute = express.Router();

cartRoute.post('/changeproductsincart', cartController.changeProductsInCart);
cartRoute.get('/', cartController.getMyCart);
cartRoute.post('/changepickproduct', cartController.pickProduct);

route.use('/cart', cartRoute);
route.get('/', userController.getUsers);
route.get('/finduser', userController.findUser);
route.post('/changestatus', userController.changeUserStatus);

module.exports = route;