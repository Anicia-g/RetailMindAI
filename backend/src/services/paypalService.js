const config = require('../config/env');

/**
 * RetailMind AI — PayPal Sandbox Integration Service
 * Interacts with PayPal REST Orders v2 API
 */
class PaypalService {
  constructor() {
    this.cachedAccessToken = null;
    this.tokenExpiresAt = 0;
  }

  getCredentials() {
    const { clientId, clientSecret, apiBase, currency, exchangeRateInrToUsd } = config.paypal;
    return {
      clientId: clientId || process.env.PAYPAL_CLIENT_ID,
      clientSecret: clientSecret || process.env.PAYPAL_CLIENT_SECRET,
      apiBase: apiBase || 'https://api-m.sandbox.paypal.com',
      currency: currency || 'USD',
      exchangeRateInrToUsd: exchangeRateInrToUsd || 85,
    };
  }

  /**
   * Generates or retrieves cached OAuth2 Bearer token from PayPal Sandbox
   */
  async getAccessToken() {
    const { clientId, clientSecret, apiBase } = this.getCredentials();

    if (!clientId || !clientSecret) {
      throw new Error(
        'PayPal Sandbox credentials not configured. Please add PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET to your backend/.env file.'
      );
    }

    // Return cached token if valid (with 60-second safety buffer)
    if (this.cachedAccessToken && Date.now() < this.tokenExpiresAt - 60000) {
      return this.cachedAccessToken;
    }

    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const response = await fetch(`${apiBase}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Failed to authenticate with PayPal: ${response.status} ${errText}`);
    }

    const data = await response.json();
    this.cachedAccessToken = data.access_token;
    this.tokenExpiresAt = Date.now() + data.expires_in * 1000;

    return this.cachedAccessToken;
  }

  /**
   * Creates a PayPal Order (v2) with intent CAPTURE
   * @param {Object} params
   * @param {number} params.amountInInr - Cart grand total in INR
   * @param {string} params.referenceId - Internal order or cart reference
   * @param {string} params.description - Optional item description
   */
  async createOrder({ amountInInr, referenceId, description }) {
    const { apiBase, currency, exchangeRateInrToUsd } = this.getCredentials();
    const accessToken = await this.getAccessToken();

    // Convert INR to PayPal target currency (default USD)
    let finalAmount = Number(amountInInr);
    let finalCurrency = currency;

    if (currency === 'USD') {
      finalAmount = Number((amountInInr / exchangeRateInrToUsd).toFixed(2));
      // Safety check: ensure minimum 0.50 USD
      if (finalAmount < 0.5) finalAmount = 0.5;
    }

    const orderPayload = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: referenceId || `RM-${Date.now()}`,
          description: description || 'RetailMind AI Supermarket Order',
          amount: {
            currency_code: finalCurrency,
            value: finalAmount.toFixed(2),
          },
        },
      ],
      application_context: {
        brand_name: 'RetailMind AI Supermarket',
        landing_page: 'NO_PREFERENCE',
        user_action: 'PAY_NOW',
        shipping_preference: 'NO_SHIPPING',
      },
    };

    const response = await fetch(`${apiBase}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderPayload),
    });

    const data = await response.json();

    if (!response.ok) {
      const errMsg = data.message || (data.details && data.details[0]?.description) || 'Failed to create PayPal order';
      throw new Error(`PayPal Create Order Error: ${errMsg}`);
    }

    return {
      orderId: data.id,
      status: data.status,
      currency: finalCurrency,
      amount: finalAmount,
      originalAmountInr: amountInInr,
    };
  }

  /**
   * Captures an authorized PayPal Order
   * @param {string} paypalOrderId - PayPal Order ID (e.g. 5O190127TN364715T)
   */
  async captureOrder(paypalOrderId) {
    const { apiBase } = this.getCredentials();
    const accessToken = await this.getAccessToken();

    const response = await fetch(`${apiBase}/v2/checkout/orders/${paypalOrderId}/capture`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      const errMsg = data.message || (data.details && data.details[0]?.description) || 'Failed to capture PayPal payment';
      throw new Error(`PayPal Capture Error: ${errMsg}`);
    }

    const capture = data.purchase_units?.[0]?.payments?.captures?.[0];
    const captureId = capture?.id || data.id;
    const captureStatus = capture?.status || data.status;

    return {
      success: captureStatus === 'COMPLETED',
      paypalOrderId: data.id,
      captureId,
      status: captureStatus,
      payer: data.payer,
      amount: capture?.amount,
      raw: data,
    };
  }

  /**
   * Retrieves PayPal Order details
   */
  async getOrderDetails(paypalOrderId) {
    const { apiBase } = this.getCredentials();
    const accessToken = await this.getAccessToken();

    const response = await fetch(`${apiBase}/v2/checkout/orders/${paypalOrderId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch PayPal order details for ID: ${paypalOrderId}`);
    }

    return await response.json();
  }
}

module.exports = new PaypalService();

