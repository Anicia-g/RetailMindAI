const express = require('express');
const router = express.Router();
const mlController = require('../controllers/mlController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

// K-Means Customer Segmentation (Admin / Seller)
router.get('/customer-segmentation', protect, requireRole('ADMIN', 'SELLER'), mlController.getCustomerSegmentation);
router.post('/customer-segmentation', protect, requireRole('ADMIN', 'SELLER'), mlController.getCustomerSegmentation);

// Demand Forecasting (Admin / Seller)
router.get('/forecast/:productId', protect, requireRole('ADMIN', 'SELLER'), mlController.getDemandForecast);

// Inventory Risk Prediction (Admin / Seller)
router.get('/inventory-risk', protect, requireRole('ADMIN', 'SELLER'), mlController.getInventoryRisk);

// Smart Discount Recommendation (ID3 / C4.5) (Admin / Seller)
router.post('/discount-recommendation', protect, requireRole('ADMIN', 'SELLER'), mlController.getDiscountRecommendation);
router.get('/discount-recommendation/:productId', protect, requireRole('ADMIN', 'SELLER'), (req, res, next) => {
  req.body.productId = req.params.productId;
  req.body.model = req.query.model || 'C4.5';
  return mlController.getDiscountRecommendation(req, res, next);
});

// Transaction Anomaly Detection (Isolation Forest) (Admin)
router.post('/anomaly-detection', protect, requireRole('ADMIN'), mlController.detectAnomaly);

// ML Model Evaluation & Performance Metrics (Admin)
router.get('/models/performance', protect, requireRole('ADMIN'), mlController.getModelPerformance);

module.exports = router;
