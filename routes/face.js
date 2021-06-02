var express = require('express');
var router = express.Router();
var faceController = require('../controllers/faceController');

router.route('/').get(faceController.getFace);
router.route('/').post(faceController.postFace);
router.route('/check').post(faceController.checkFace);

module.exports = router;
