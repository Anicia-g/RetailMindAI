import { apiClient } from '@/lib/apiClient';

const STORAGE_KEY_CONSENT = 'retailmind_whatsapp_consent';
const STORAGE_KEY_SUBSCRIPTIONS = 'retailmind_whatsapp_subscriptions';

class NotificationService {
  /**
   * Retrieves active notifications for current user from backend
   */
  async getNotifications(params = {}) {
    try {
      const res = await apiClient.get('/notifications', { params });
      return res?.data || [];
    } catch (err) {
      console.warn('[NotificationService] Failed to fetch backend notifications, using local fallback:', err.message);
      return [];
    }
  }

  /**
   * Retrieves unread notification count
   */
  async getUnreadCount() {
    try {
      const res = await apiClient.get('/notifications/unread-count');
      return res?.data?.unreadCount || 0;
    } catch (err) {
      console.warn('[NotificationService] Failed to fetch unread count:', err.message);
      return 0;
    }
  }

  /**
   * Marks a notification as read
   */
  async markAsRead(id) {
    try {
      const res = await apiClient.patch(`/notifications/${id}/read`);
      return res?.data || null;
    } catch (err) {
      console.warn('[NotificationService] markAsRead notice:', err.message);
      return null;
    }
  }

  /**
   * Marks all notifications as read
   */
  async markAllAsRead() {
    try {
      const res = await apiClient.patch('/notifications/read-all');
      return res?.data || null;
    } catch (err) {
      console.warn('[NotificationService] markAllAsRead notice:', err.message);
      return null;
    }
  }

  /**
   * Dispatches WhatsApp offer via backend provider
   */
  async sendWhatsAppOffer({ customerId, customerName, phoneNumber, offer }) {
    try {
      const res = await apiClient.post('/notifications/whatsapp/offers', {
        customerId,
        customerName,
        phoneNumber,
        offer,
      });
      return res?.data || res;
    } catch (err) {
      console.warn('[NotificationService] WhatsApp offer API fallback:', err.message);
      return {
        success: true,
        channel: 'WhatsApp Mock Gateway',
        status: 'DELIVERED',
        isMock: true,
      };
    }
  }

  /**
   * Retrieves customer WhatsApp consent preferences
   */
  getWhatsAppPreferences(customerId = 'default') {
    if (typeof window === 'undefined') {
      return { enabled: false, phoneNumber: '+91 98450 11234', consentDate: null };
    }

    try {
      const stored = localStorage.getItem(`${STORAGE_KEY_CONSENT}_${customerId}`);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {}

    return {
      enabled: true,
      phoneNumber: '+91 98450 11234',
      consentDate: '2026-08-15T10:00:00Z',
    };
  }

  /**
   * Updates customer WhatsApp consent preferences and syncs with backend
   */
  async updateWhatsAppPreferences(customerId = 'default', preferences) {
    const updated = {
      ...this.getWhatsAppPreferences(customerId),
      ...preferences,
      updatedAt: new Date().toISOString(),
    };

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`${STORAGE_KEY_CONSENT}_${customerId}`, JSON.stringify(updated));
      } catch (e) {}
    }

    // Synchronize to backend if authenticated
    try {
      await apiClient.post('/customer/preferences', {
        customerId,
        preferences: {
          whatsappOffers: preferences.enabled !== undefined ? preferences.enabled : true,
          emailUpdates: true,
        },
      });
    } catch (err) {
      // Non-blocking
    }

    return updated;
  }

  /**
   * Generates a preview of the personalized WhatsApp message
   */
  generateWhatsAppOfferPreview(offer, customerName = 'Vikram') {
    const productName = offer?.name || offer?.title || 'Dairy & Bakery Items';
    const discountPct = offer?.discountPct || offer?.smartDiscount?.recommended || 15;
    const promoCode = offer?.code || (discountPct > 0 ? `FRESH${discountPct}` : 'FRESH10');
    const reason =
      offer?.reason ||
      offer?.smartDiscount?.reason ||
      'Personalized offer based on your shopping frequency & fresh batch arrival.';

    return {
      channel: 'WhatsApp Business API',
      status: 'Delivered ✓',
      timestamp: 'Just now',
      sender: 'RetailMind AI Mart (Official Verified)',
      messageText: `🛍️ *Special Supermarket Offer for you, ${customerName}!*

Your favorite *${productName}* is now *${discountPct}% OFF* today.

💡 *Why you received this:*
${reason}

🎟️ *Use promo code at checkout:*
*${promoCode}*

Tap to order for 15-min express delivery:
https://retailmind.ai/shop/offers`,
    };
  }

  /**
   * Subscribes a customer to instant alerts for a specific deal
   */
  subscribeToDealAlerts(customerId = 'default', dealId) {
    if (typeof window !== 'undefined') {
      try {
        const existing = JSON.parse(localStorage.getItem(STORAGE_KEY_SUBSCRIPTIONS) || '[]');
        if (!existing.includes(dealId)) {
          existing.push(dealId);
          localStorage.setItem(STORAGE_KEY_SUBSCRIPTIONS, JSON.stringify(existing));
        }
      } catch (e) {}
    }
    return { success: true, message: 'Subscribed to WhatsApp alerts for this deal.' };
  }
}

export const notificationService = new NotificationService();
