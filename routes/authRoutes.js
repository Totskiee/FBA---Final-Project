const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/logout', authController.logout); // Supports direct GET redirect if needed
router.get('/status', authController.status);

module.exports = router;
