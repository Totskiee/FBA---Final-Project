const express = require('express');
const router = express.Router();
const descriptiveController = require('../controllers/descriptiveController');

router.get('/summary', descriptiveController.getSummary);

module.exports = router;
