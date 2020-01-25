const express = require('express');
const router = express.Router();
const ordersController = require('../controllers/ordersController');

router.get('/', ordersController.index);
router.post('/', ordersController.create);
router.get('/:id', ordersController.show);
router.put('/:id', ordersController.edit);
router.delete('/:id', ordersController.cancel);

module.exports = router;