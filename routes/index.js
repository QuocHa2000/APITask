var express = require('express');
var router = express.Router();

let User = require('../modal/user.modal');

/* GET home page. */
router.get('/', function(req, res, next) {
    User.find(function(err, user) {
        if (err) res.json(err);
        res.json(user);
    })
})

module.exports = router;