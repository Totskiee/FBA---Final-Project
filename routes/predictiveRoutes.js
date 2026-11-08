const express = require('express');
const router = express.Router();
const predictiveController = require('../controllers/predictiveController');

router.post('/estimate', predictiveController.estimateCost);

module.exports = router;
