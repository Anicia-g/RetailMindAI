const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

// Customer checkout route
router.post('/', protect, requireRole('CUSTOMER', 'ADMIN', 'SELLER'), orderController.createCustomerOrder);

// Order querying
router.get('/', protect, orderController.getAllOrders);
router.get('/:id', protect, orderController.getOrderById);
router.patch('/:id/status', protect, requireRole('ADMIN', 'SELLER'), orderController.updateOrderStatus);

module.exports = router;
