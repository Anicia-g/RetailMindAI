const paymentService = require('../services/paymentService');
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
}

module.exports = new PaymentController();
