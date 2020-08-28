const express = require('express');
const route = express.Router();
const controller = require('./user.controller');
const multer = require('multer');
const checkAdmin = require('../../middleware/checkadmin.middleware');
const checkLogin = require('../../middleware/checklogin.middleware');
const storage = multer.diskStorage({
    destination: 'public/upload/',
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + file.originalname);
    }
});
const {
    changePasswordForUserMiddleware,
    changeProductInCartForUserMiddleware,
    changeUserStatusForAdminMiddleware,
    checkProductForUserMiddleware
} = require('./user.middleware');
const fileFilter = function(req, file, cb) {
    if (
        file.mimetype === 'image/jpeg' ||
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg'
    ) {
        cb(null, true);
    } else {
        cb(null, false);
    }
};
const upload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 5 },
    fileFilter: fileFilter,
});

const adminRoute = express.Router();
const userRoute = express.Router();
const cartRoute = express.Router();


adminRoute.get('/', controller.getUsersForAdmin);
adminRoute.get('/finduser', controller.findUserForAdmin);
adminRoute.post(
    '/changestatus',
    changeUserStatusForAdminMiddleware,
    controller.changeUserStatusForAdmin);

userRoute.get('/myinfo', controller.getInfoForUser);
userRoute.post('/updateinfo', controller.updateInfoForUser);
userRoute.post(
    '/changepassword',
    changePasswordForUserMiddleware,
    controller.changePasswordForUser);
userRoute.post(
    '/uploadAvatar',
    upload.single('avatar'),
    controller.uploadAvatarForUser);

cartRoute.post(
    '/changeproductsincart',
    changeProductInCartForUserMiddleware,
    controller.changeProductsInCartForUser);
cartRoute.get('/', controller.getCartForUser);
cartRoute.post(
    '/changepickproduct',
    checkProductForUserMiddleware,
    controller.pickProductForUser);

route.use('/admin', checkAdmin, adminRoute);
route.use('/me', checkLogin, userRoute);
route.use('/cart', checkLogin, cartRoute);

module.exports = route;