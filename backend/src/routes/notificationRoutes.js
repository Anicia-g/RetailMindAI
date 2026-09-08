const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

// 1. Notification Management APIs
router.get('/', protect, notificationController.getNotifications);
router.get('/unread-count', protect, notificationController.getUnreadCount);
router.patch('/read-all', protect, notificationController.markAllAsRead);
router.patch('/:id/read', protect, notificationController.markAsRead);

// 2. Automated Alert Generation (Low stock & ML risk)
router.post('/generate-alerts', protect, requireRole('ADMIN', 'SELLER'), notificationController.generateAlerts);

// 3. WhatsApp Communication APIs
router.post('/whatsapp/offers', protect, requireRole('ADMIN', 'SELLER'), notificationController.sendWhatsAppOffer);
router.get('/whatsapp/logs', protect, requireRole('ADMIN', 'SELLER'), notificationController.getWhatsAppLogs);

module.exports = router;
