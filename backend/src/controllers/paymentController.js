const paymentService = require('../services/paymentService');
const paypalService = require('../services/paypalService');
const orderService = require('../services/orderService');
const { successResponse } = require('../utils/apiResponse');

class PaymentController {
  async getAllPayments(req, res, next) {
    try {
      const payments = await paymentService.getAllPayments(req.query);
      return successResponse(res, payments, 'Payment transactions retrieved');
    } catch (err) {
      next(err);
    }
  }

  async getPaymentById(req, res, next) {
    try {
      const payment = await paymentService.getPaymentById(req.params.id);
      if (!payment) return res.status(404).json({ success: false, message: 'Payment record not found' });
      return successResponse(res, payment);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Initializes a PayPal Sandbox order
   * POST /api/payments/paypal/create-order
   */
  async createPaypalOrder(req, res, next) {
    try {
      const { amount, grandTotal, items } = req.body;
      const orderAmount = Number(amount || grandTotal || 0);

      if (!orderAmount || orderAmount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid order amount. Total must be greater than zero.',
        });
      }

      const paypalOrder = await paypalService.createOrder({
        amountInInr: orderAmount,
        referenceId: `RM-CART-${Date.now()}`,
        description: `RetailMind AI Supermarket Order (${items?.length || 1} items)`,
      });

      return successResponse(res, paypalOrder, 'PayPal Sandbox order created successfully');
    } catch (err) {
      next(err);
    }
  }

  /**
   * Captures an approved PayPal order and saves order into MySQL
   * POST /api/payments/paypal/capture-order
   */
  async capturePaypalOrder(req, res, next) {
    try {
      const { paypalOrderId, orderData } = req.body;

      if (!paypalOrderId) {
        return res.status(400).json({
          success: false,
          message: 'Missing required field: paypalOrderId.',
        });
      }

      // 1. Capture payment with PayPal Orders v2 API
      const captureResult = await paypalService.captureOrder(paypalOrderId);

      if (!captureResult.success) {
        return res.status(400).json({
          success: false,
          message: `PayPal payment capture incomplete. Status: ${captureResult.status}`,
          details: captureResult,
        });
      }

      // 2. Persist order and payment in database
      const finalOrderPayload = {
        ...(orderData || {}),
        paymentMethod: 'PAYPAL',
        gateway: 'PayPal Sandbox Gateway',
        transactionRef: captureResult.captureId || paypalOrderId,
      };

      const createdOrder = await orderService.createCustomerOrder(finalOrderPayload, req.user);

      return successResponse(
        res,
        {
          order: createdOrder,
          capture: captureResult,
        },
        'PayPal payment captured and order confirmed successfully',
        201
      );
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new PaymentController();
