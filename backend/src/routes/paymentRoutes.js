const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

// PayPal Sandbox Checkout Routes
router.post('/paypal/create-order', protect, paymentController.createPaypalOrder);
router.post('/paypal/capture-order', protect, paymentController.capturePaypalOrder);

router.get('/', protect, requireRole('ADMIN', 'SELLER'), paymentController.getAllPayments);
router.get('/:id', protect, paymentController.getPaymentById);

module.exports = router;
