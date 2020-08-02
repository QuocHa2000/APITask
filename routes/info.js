const express = require('express');
const route = express.Router();
const controller = require('../controllers/info.controller');
const multer = require('multer');
const storage = multer.diskStorage({
    destination: 'public/upload/',
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + file.originalname);
    }
})
const fileFilter = function(req, file, cb) {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true);
    } else {
        cb(null, false);
    }
}
const upload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 5 },
    fileFilter: fileFilter
});
route.get('/myinfo', controller.getMyInfo);
route.post('/updateinfo', controller.updateInfo);
route.post('/changepassword', controller.changePassword);
route.post('/uploadAvatar/:id', upload.single('avatar'), controller.uploadAvatar);

module.exports = route;