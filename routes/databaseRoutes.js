const express = require('express');
const router = express.Router();
const databaseController = require('../controllers/databaseController');
const { requireDbPin } = require('../middlewares/dbAuthMiddleware');

// Public PIN verification endpoint
router.post('/verify-pin', databaseController.verifyPin);

// Protected Database CRUD Endpoints (Requires Valid PIN Token)
router.use(requireDbPin);
router.get('/tables', databaseController.getTablesList);
router.get('/:tableName', databaseController.getTableData);
router.post('/:tableName', databaseController.insertRecord);
router.put('/:tableName/:id', databaseController.updateRecord);
router.delete('/:tableName/:id', databaseController.deleteRecord);

module.exports = router;
