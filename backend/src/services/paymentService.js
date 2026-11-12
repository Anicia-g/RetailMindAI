const paymentRepository = require('../repositories/paymentRepository');

class PaymentService {
  async getAllPayments(filters = {}) {
    return await paymentRepository.findAllPayments(filters);
  }

  async getPaymentById(id) {
    const payment = await paymentRepository.findById(id);
    if (!payment) {
      throw new Error(`Payment '${id}' not found.`);
    }
    return paymentRepository.toDTO(payment);
  }
}

module.exports = new PaymentService();
