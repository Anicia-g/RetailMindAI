const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

// 1. Role-aware conversational AI assistant query
router.post('/chat', protect, aiController.chat);

// 2. Unified Dashboard Intelligence Summary
router.get('/insights', protect, aiController.getInsights);

// 3. Persistent AI Recommendations
router.get('/recommendations', protect, aiController.getRecommendations);
router.post('/recommendations/:id/apply', protect, requireRole('ADMIN', 'SELLER'), aiController.applyRecommendation);

// 4. Smart Reorder Engine (Prioritized replenishment recommendations)
router.get('/reorder', protect, requireRole('ADMIN', 'SELLER'), aiController.getReorder);

// 5. Smart Discount Intelligence Candidates
router.get('/discount-candidates', protect, requireRole('ADMIN', 'SELLER'), aiController.getDiscountCandidates);

// 6. Customer Segment Insights & Retention Actions
router.get('/customer-insights', protect, requireRole('ADMIN', 'SELLER'), aiController.getCustomerInsights);

// 7. Demand Forecast Intelligence
router.get('/forecast-insights', protect, requireRole('ADMIN', 'SELLER'), aiController.getForecastInsights);

// 8. Transaction Anomaly Audit Insights (Admin only)
router.get('/anomaly-insights', protect, requireRole('ADMIN'), aiController.getAnomalyInsights);

// 9. Conversational Chat History
router.get('/history', protect, aiController.getChatHistory);

module.exports = router;
