const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

// Admin Dashboard KPI & Aggregation endpoint
router.get('/dashboard', protect, requireRole('ADMIN'), adminController.getDashboard);

module.exports = router;
