var express = require('express');
var router = express.Router();
var indexController = require('../controllers/indexController');

router.route('/welcome').get(indexController.welcome);

module.exports = router;
