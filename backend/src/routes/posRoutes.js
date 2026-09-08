const express = require('express');
const router = express.Router();
const posController = require('../controllers/posController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

// POS Sales endpoint for Sellers and Admins
router.post('/sales', protect, requireRole('SELLER', 'ADMIN'), posController.processSale);

module.exports = router;
