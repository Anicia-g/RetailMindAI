/**
 * WhatsApp Notification Service
 *
 * NOTE: The frontend does NOT directly call WhatsApp APIs or store API credentials.
 * This service manages customer consent preferences, formats preview messages, and prepares
 * the API contracts for the future Express backend & WhatsApp Business API gateway.
 */

const STORAGE_KEY_CONSENT = 'retailmind_whatsapp_consent';
const STORAGE_KEY_SUBSCRIPTIONS = 'retailmind_whatsapp_subscriptions';

class NotificationService {
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
      enabled: true, // Default opt-in initialized for demo convenience with toggle available
      phoneNumber: '+91 98450 11234',
      consentDate: '2026-08-15T10:00:00Z',
    };
  }

  /**
   * Updates customer WhatsApp consent preferences and persists to localStorage
   */
  updateWhatsAppPreferences(customerId = 'default', preferences) {
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

    return updated;
  }

  /**
   * Generates a preview of the personalized WhatsApp message for a given offer and customer
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
