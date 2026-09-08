const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

// Inventory requires Admin or Seller authorization (Customers forbidden)
router.get('/', protect, requireRole('ADMIN', 'SELLER'), inventoryController.getAllInventory);
router.get('/transactions', protect, requireRole('ADMIN', 'SELLER'), inventoryController.getStockTransactions);
router.get('/:id', protect, requireRole('ADMIN', 'SELLER'), inventoryController.getInventoryById);
router.post('/adjust', protect, requireRole('ADMIN', 'SELLER'), inventoryController.adjustStock);

module.exports = router;
