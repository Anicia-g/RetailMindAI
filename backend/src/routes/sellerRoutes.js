const express = require('express');
const router = express.Router();
const sellerController = require('../controllers/sellerController');
const productController = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

// Seller Terminal Endpoints (Seller & Admin access)
router.get('/profile', protect, requireRole('SELLER', 'ADMIN'), sellerController.getProfile);
router.get('/dashboard', protect, requireRole('SELLER', 'ADMIN'), sellerController.getDashboard);
router.get('/performance', protect, requireRole('SELLER', 'ADMIN'), sellerController.getDashboard);
router.get('/best-sellers', protect, requireRole('SELLER', 'ADMIN'), sellerController.getBestSellers);
router.get('/best-customer', protect, requireRole('SELLER', 'ADMIN'), sellerController.getBestCustomer);
router.get('/products', protect, requireRole('SELLER', 'ADMIN'), productController.getProductsByStore);
router.get('/analytics', protect, requireRole('SELLER', 'ADMIN'), sellerController.getAnalytics);

// Admin Management of Sellers
router.get('/', protect, requireRole('ADMIN'), sellerController.getAllSellers);
router.post('/', protect, requireRole('ADMIN'), sellerController.createSeller);
router.get('/:id', protect, requireRole('ADMIN'), sellerController.getSellerById);
router.put('/:id', protect, requireRole('ADMIN'), sellerController.updateSeller);

module.exports = router;
