const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoriesController');

router.get('/', inventoryController.index);
router.post('/', inventoryController.create);
router.get('/:id', inventoryController.show);
router.put('/:id', inventoryController.edit);
router.delete('/:id', inventoryController.show);

module.exports = router;