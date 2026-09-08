const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const orderController = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

// Customer Self-Service Endpoints
router.get('/profile', protect, requireRole('CUSTOMER', 'ADMIN'), customerController.getProfile);
router.put('/profile', protect, requireRole('CUSTOMER', 'ADMIN'), customerController.updateProfile);
router.get('/preferences', protect, customerController.getPreferences);
router.post('/preferences', protect, customerController.updatePreferences);
router.put('/preferences', protect, customerController.updatePreferences);
router.get('/orders', protect, requireRole('CUSTOMER', 'ADMIN'), orderController.getCustomerOrders);
router.get('/clusters', protect, requireRole('ADMIN', 'SELLER'), customerController.getCustomerClusters);

// Admin / Seller Management of Customers
router.get('/', protect, requireRole('ADMIN', 'SELLER'), customerController.getAllCustomers);
router.post('/', protect, requireRole('ADMIN', 'SELLER'), customerController.createCustomer);
router.get('/:id', protect, requireRole('ADMIN', 'SELLER'), customerController.getCustomerById);
router.put('/:id', protect, requireRole('ADMIN', 'SELLER'), customerController.updateCustomer);
router.delete('/:id', protect, requireRole('ADMIN'), customerController.deleteCustomer);

module.exports = router;
