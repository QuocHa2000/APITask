const express = require('express');
const route = express.Router();
const controller = require('./product.controller');
const enterpriseVerify = require('../../middleware/enterprise.middleware');
const multer = require('multer');
const storage = multer.diskStorage({
    destination: 'public/upload/',
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + file.originalname);
    },
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

route.get('/', controller.getProduct);
route.post(
    '/',
    enterpriseVerify,
    upload.array('image', 10),
    controller.postProduct
);
route.get('/productdetail/:id', controller.productDetail);
route.get('/myproduct', enterpriseVerify, controller.getMyProduct);
route.get('/disabledproduct/:id', enterpriseVerify, controller.disabledProduct);
route.get('/findproduct', controller.findProduct);
route.post(
    '/updateproduct',
    enterpriseVerify,
    upload.array('image', 10),
    controller.updateProduct
);

module.exports = route;