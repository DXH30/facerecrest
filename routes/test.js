var express = require('express');
var router = express.Router();
var testController = require('../controllers/testController');
var { User } = require('../models/user');

router.route('/').get(testController.getTest);

module.exports = router;
