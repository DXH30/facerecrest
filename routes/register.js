var express = require('express');
var registerController = require('../controllers/registerController');
var router = express.Router();

router.route('/').get(registerController.getRegister);
router.route('/').post(registerController.postRegister);

module.exports = router;
