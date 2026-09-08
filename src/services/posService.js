import { apiClient } from '@/lib/apiClient';

class PosService {
  /**
   * Dispatches POS sale transaction to Express REST API
   * Triggers atomic validation, inventory decrement, payment creation & transaction logging
   */
  async processSale(salePayload) {
    try {
      const response = await apiClient.post('/seller/sales', salePayload);
      if (response && response.data) {
        return response.data;
      }
    } catch (err) {
      console.error('[PosService] Error processing sale on backend:', err.message);
      throw err;
    }
  }
}

export const posService = new PosService();
