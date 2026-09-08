const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

// Revenue Analytics
router.get('/revenue', protect, requireRole('ADMIN'), analyticsController.getRevenueAnalytics);

// Sales Volume & Trend Analytics
router.get('/sales', protect, requireRole('ADMIN', 'SELLER'), analyticsController.getSalesAnalytics);

// Category Performance Analytics
router.get('/categories', protect, requireRole('ADMIN', 'SELLER'), analyticsController.getCategoryAnalytics);

// Store-Level Multi-Branch Analytics
router.get('/stores', protect, requireRole('ADMIN'), analyticsController.getStoreAnalytics);

// Payment Method Distribution Analytics
router.get('/payments', protect, requireRole('ADMIN'), analyticsController.getPaymentAnalytics);

// Inventory Health & Capital Exposure
router.get('/inventory', protect, requireRole('ADMIN', 'SELLER'), analyticsController.getInventoryAnalytics);

// Seller Performance Rankings
router.get('/sellers', protect, requireRole('ADMIN'), analyticsController.getSellerAnalytics);

// Customer RFM Feature Dataset & Top Customers
router.get('/customers/rfm', protect, requireRole('ADMIN'), analyticsController.getCustomerRFM);
router.get('/customers/top', protect, requireRole('ADMIN', 'SELLER'), analyticsController.getTopCustomers);
router.get('/customers', protect, requireRole('ADMIN'), analyticsController.getCustomerAnalytics);

// Chronological Product Demand History Dataset (for ARIMA/Holt-Winters)
router.get('/products/:productId/demand-history', protect, requireRole('ADMIN', 'SELLER'), analyticsController.getDemandHistory);

// Inventory Risk Feature Dataset
router.get('/inventory/risk-features', protect, requireRole('ADMIN'), analyticsController.getInventoryRiskFeatures);

// Discount Feature Dataset (for ID3/C4.5 Decision Trees)
router.get('/products/discount-features', protect, requireRole('ADMIN', 'SELLER'), analyticsController.getDiscountFeatures);

// Data Quality & Transaction Integrity Audit
router.get('/data-quality', protect, requireRole('ADMIN'), analyticsController.getDataQualityAudit);

module.exports = router;
