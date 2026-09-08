const express = require('express');
const router = express.Router();
const purchaseOrderController = require('../controllers/purchaseOrderController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

// Admin Purchase Order Management
router.get('/', protect, requireRole('ADMIN'), purchaseOrderController.getAllPurchaseOrders);
router.get('/:id', protect, requireRole('ADMIN'), purchaseOrderController.getPurchaseOrderById);
router.post('/', protect, requireRole('ADMIN'), purchaseOrderController.createPurchaseOrder);
router.patch('/:id/status', protect, requireRole('ADMIN'), purchaseOrderController.updateStatus);

module.exports = router;
