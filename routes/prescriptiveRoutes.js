const express = require('express');
const router = express.Router();
const prescriptiveController = require('../controllers/prescriptiveController');

router.get('/optimize', prescriptiveController.optimizeRoutes);

module.exports = router;
