const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplierController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

// Admin-only Supplier Management
router.get('/', protect, requireRole('ADMIN'), supplierController.getAllSuppliers);
router.get('/:id', protect, requireRole('ADMIN'), supplierController.getSupplierById);
router.post('/', protect, requireRole('ADMIN'), supplierController.createSupplier);
router.put('/:id', protect, requireRole('ADMIN'), supplierController.updateSupplier);
router.delete('/:id', protect, requireRole('ADMIN'), supplierController.deleteSupplier);

module.exports = router;
