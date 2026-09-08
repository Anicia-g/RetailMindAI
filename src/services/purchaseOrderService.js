import { apiClient } from '@/lib/apiClient';
import { initialPurchaseOrders, aiSuggestedOrder } from '@/data/purchaseOrders';

class PurchaseOrderService {
  async getAllPurchaseOrders() {
    try {
      const response = await apiClient.get('/purchase-orders');
      if (response && response.data && response.data.length > 0) {
        return response.data;
      }
    } catch (err) {
      console.warn('[PurchaseOrderService] API unavailable, using local fallback:', err.message);
    }
    return initialPurchaseOrders;
  }

  async getPurchaseOrderById(id) {
    try {
      const response = await apiClient.get(`/purchase-orders/${id}`);
      if (response && response.data) {
        return response.data;
      }
    } catch (err) {
      console.warn('[PurchaseOrderService] API unavailable for PO id:', id);
    }
    return initialPurchaseOrders.find((p) => p.id === id || p.poId === id) || null;
  }

  async createPurchaseOrder(poData) {
    try {
      const response = await apiClient.post('/purchase-orders', poData);
      if (response && response.data) {
        return response.data;
      }
    } catch (err) {
      console.error('[PurchaseOrderService] Error creating PO:', err);
    }
    return { id: `PO-${Date.now().toString().slice(-4)}`, ...poData };
  }

  async updateStatus(id, status) {
    try {
      const response = await apiClient.patch(`/purchase-orders/${id}/status`, { status });
      if (response && response.data) {
        return response.data;
      }
    } catch (err) {
      console.error('[PurchaseOrderService] Error updating PO status:', err);
    }
    return { id, status };
  }

  getAiSuggestedOrder() {
    return aiSuggestedOrder;
  }
}

export const purchaseOrderService = new PurchaseOrderService();
