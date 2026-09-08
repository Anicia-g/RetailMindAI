import { apiClient } from '@/lib/apiClient';
import { initialPayments } from '@/data/payments';

class PaymentService {
  async getAllPayments(filters = {}) {
    try {
      const response = await apiClient.get('/payments', filters);
      if (response && response.data && response.data.length > 0) {
        return response.data;
      }
    } catch (err) {
      console.warn('[PaymentService] API unavailable, using local fallback:', err.message);
    }
    return initialPayments;
  }

  async getPaymentById(id) {
    try {
      const response = await apiClient.get(`/payments/${id}`);
      if (response && response.data) {
        return response.data;
      }
    } catch (err) {
      console.warn('[PaymentService] API unavailable for payment id:', id);
    }
    return initialPayments.find((p) => p.id === id || p.paymentId === id) || null;
  }
}

export const paymentService = new PaymentService();
