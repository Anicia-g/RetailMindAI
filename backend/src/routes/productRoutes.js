const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);

// Protected Admin / Seller routes
router.post('/', protect, requireRole('ADMIN'), productController.createProduct);
router.put('/:id', protect, requireRole('ADMIN', 'SELLER'), productController.updateProduct);
router.delete('/:id', protect, requireRole('ADMIN'), productController.deleteProduct);
router.patch('/:id/discount', protect, requireRole('ADMIN', 'SELLER'), productController.updateDiscount);

module.exports = router;
