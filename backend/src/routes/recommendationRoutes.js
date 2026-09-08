const express = require('express');
const router = express.Router();
const recommendationController = require('../controllers/recommendationController');

// Recommendations (Personalized / Trending)
router.get('/', recommendationController.getRecommendations);

// Frequently Bought Together Bundle
router.get('/frequently-bought-together/:productId', recommendationController.getFrequentlyBoughtTogether);

module.exports = router;
