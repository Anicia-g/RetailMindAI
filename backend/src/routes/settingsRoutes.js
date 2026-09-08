const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

router.get('/', protect, settingsController.getSettings);
router.put('/', protect, requireRole('ADMIN'), settingsController.updateSettings);

module.exports = router;
