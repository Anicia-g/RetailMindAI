const Payment = require('../models/Payment');

class PaymentService {
  async getAllPayments(filters = {}) {
    const query = { bit_IsActive: true };

    if (filters.search) {
      const q = filters.search.trim();
      query.$or = [
        { customerName: { $regex: q, $options: 'i' } },
        { paymentId: { $regex: q, $options: 'i' } },
        { orderId: { $regex: q, $options: 'i' } },
        { referenceId: { $regex: q, $options: 'i' } },
      ];
    }

    if (filters.method && filters.method !== 'All') {
      query.method = { $regex: filters.method, $options: 'i' };
    }

    if (filters.status && filters.status !== 'All') {
      query.status = filters.status;
    }

    return await Payment.find(query).sort({ createdAt: -1 });
  }

  async getPaymentById(id) {
    return await Payment.findOne({
      $or: [{ paymentId: id }, { orderId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
      bit_IsActive: true,
    });
  }
}

module.exports = new PaymentService();
