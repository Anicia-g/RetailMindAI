const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

router.get('/sales', protect, requireRole('ADMIN', 'SELLER'), reportController.getSalesReport);
router.get('/inventory', protect, requireRole('ADMIN', 'SELLER'), reportController.getInventoryReport);
router.get('/customers', protect, requireRole('ADMIN'), reportController.getCustomersReport);
router.get('/suppliers', protect, requireRole('ADMIN'), reportController.getSuppliersReport);
router.get('/purchases', protect, requireRole('ADMIN'), reportController.getPurchasesReport);

module.exports = router;
