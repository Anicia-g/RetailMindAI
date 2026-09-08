import { apiClient } from '@/lib/apiClient';
import { initialSales } from '@/data/sales';

class OrderService {
  async getAllOrders(filters = {}) {
    try {
      const response = await apiClient.get('/orders', filters);
      if (response && response.data && response.data.length > 0) {
        return response.data;
      }
    } catch (err) {
      console.warn('[OrderService] API unavailable, using local fallback:', err.message);
    }
    return initialSales;
  }

  async getOrderById(id) {
    try {
      const response = await apiClient.get(`/orders/${id}`);
      if (response && response.data) {
        return response.data;
      }
    } catch (err) {
      console.warn('[OrderService] API unavailable for order id:', id);
    }
    return initialSales.find((s) => s.id === id || s.orderId === id) || null;
  }

  async getCustomerOrders() {
    try {
      const response = await apiClient.get('/customer/orders');
      if (response && response.data) {
        return response.data;
      }
    } catch (err) {
      console.warn('[OrderService] Customer orders API unavailable:', err.message);
    }
    return null;
  }

  async createCustomerOrder(orderPayload) {
    try {
      const response = await apiClient.post('/orders', orderPayload);
      if (response && response.data) {
        return response.data;
      }
    } catch (err) {
      console.error('[OrderService] Error creating customer order:', err);
      throw err;
    }
  }

  async updateOrderStatus(id, status) {
    try {
      const response = await apiClient.patch(`/orders/${id}/status`, { status });
      if (response && response.data) {
        return response.data;
      }
    } catch (err) {
      console.error('[OrderService] Error updating order status:', err);
    }
    return { id, status };
  }
}

export const orderService = new OrderService();
