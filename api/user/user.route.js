const express = require('express');
const route = express.Router();
const controller = require('./user.controller');
const multer = require('multer');
const storage = multer.diskStorage({
    destination: 'public/upload/',
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + file.originalname);
    }
});
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
adminRoute.post('/changestatus', controller.changeUserStatusForAdmin);

userRoute.get('/myinfo', controller.getInfoForUser);
userRoute.post('/updateinfo', controller.updateInfoForUser);
userRoute.post('/changepassword', controller.changePasswordForUser);
userRoute.post('/uploadAvatar', upload.single('avatar'), controller.uploadAvatarForUser);

cartRoute.post('/changeproductsincart', controller.changeProductsInCartForUser);
cartRoute.get('/', controller.getCartForUser);
cartRoute.post('/changepickproduct', controller.pickProductForUser);

route.use('/admin', adminRoute);
route.use('/me', userRoute);
route.use('/cart', cartRoute);

module.exports = route;