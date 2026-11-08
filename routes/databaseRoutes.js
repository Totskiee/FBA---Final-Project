const express = require('express');
const router = express.Router();
const databaseController = require('../controllers/databaseController');

router.get('/tables', databaseController.getTablesList);
router.get('/:tableName', databaseController.getTableData);
router.post('/:tableName', databaseController.insertRecord);
router.put('/:tableName/:id', databaseController.updateRecord);
router.delete('/:tableName/:id', databaseController.deleteRecord);

module.exports = router;
