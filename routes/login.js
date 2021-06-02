var express = require('express');
var router = express.Router();
var loginController = require('../controllers/loginController');
var { User } = require('../models/user');

router.route('/').get(loginController.getLogin);
router.route('/').post(loginController.postLogin);

module.exports = router;
