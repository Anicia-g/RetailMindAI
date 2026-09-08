const notificationService = require('../services/notificationService');
const whatsappService = require('../services/whatsappService');
const { successResponse } = require('../utils/apiResponse');

class NotificationController {
  /**
   * GET /api/notifications
   * Scoped notifications for current user/role
   */
  async getNotifications(req, res, next) {
    try {
      const notifications = await notificationService.getUserNotifications(req.user, req.query);
      return successResponse(res, notifications, 'Notifications retrieved successfully');
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/notifications/unread-count
   * Live count of unread notifications
   */
  async getUnreadCount(req, res, next) {
    try {
      const count = await notificationService.getUnreadCount(req.user);
      return successResponse(res, { unreadCount: count }, 'Unread notification count retrieved');
    } catch (err) {
      next(err);
    }
  }

  /**
   * PATCH /api/notifications/:id/read
   * Mark a single notification as read
   */
  async markAsRead(req, res, next) {
    try {
      const updated = await notificationService.markAsRead(req.params.id, req.user);
      return successResponse(res, updated, 'Notification marked as read');
    } catch (err) {
      next(err);
    }
  }

  /**
   * PATCH /api/notifications/read-all
   * Mark all notifications for user as read
   */
  async markAllAsRead(req, res, next) {
    try {
      const result = await notificationService.markAllAsRead(req.user);
      return successResponse(res, result, 'All notifications marked as read');
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/notifications/generate-alerts
   * Trigger low-stock and ML risk notification alerts
   */
  async generateAlerts(req, res, next) {
    try {
      const result = await notificationService.generateSystemAlerts();
      return successResponse(res, result, 'System inventory and AI alert notifications generated');
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/notifications/whatsapp/offers
   * Send WhatsApp offer notification with customer consent check
   */
  async sendWhatsAppOffer(req, res, next) {
    try {
      const { customerId, customerName, phoneNumber, offer } = req.body;
      const result = await whatsappService.sendOfferNotification({
        customerId,
        customerName,
        phoneNumber,
        offer,
        user: req.user,
      });

      return successResponse(res, result, result.message || 'WhatsApp notification processed');
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/notifications/whatsapp/logs
   * Retrieve WhatsApp delivery log history
   */
  async getWhatsAppLogs(req, res, next) {
    try {
      const logs = await whatsappService.getDeliveryLogs(req.query.limit);
      return successResponse(res, logs, 'WhatsApp delivery logs retrieved');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new NotificationController();
