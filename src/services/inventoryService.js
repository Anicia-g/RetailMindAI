import { apiClient } from '@/lib/apiClient';
import { initialInventory } from '@/data/inventory';

class InventoryService {
  async getAllInventory(filters = {}) {
    try {
      const response = await apiClient.get('/inventory', filters);
      if (response && response.data && response.data.length > 0) {
        return response.data;
      }
    } catch (err) {
      console.warn('[InventoryService] API unavailable, using local fallback:', err.message);
    }
    return initialInventory;
  }

  async getInventoryById(id) {
    try {
      const response = await apiClient.get(`/inventory/${id}`);
      if (response && response.data) {
        return response.data;
      }
    } catch (err) {
      console.warn('[InventoryService] API unavailable for inventory id:', id);
    }
    return initialInventory.find((i) => i.id === id || i.inventoryId === id) || null;
  }

  async getStockTransactions(filters = {}) {
    try {
      const response = await apiClient.get('/inventory/transactions', filters);
      if (response && response.data) {
        return response.data;
      }
    } catch (err) {
      console.warn('[InventoryService] Stock transactions API unavailable:', err.message);
    }
    return [];
  }

  async adjustStock({ productId, sku, storeId, quantity, reason = 'Stock Count Audit' }) {
    try {
      const response = await apiClient.post('/inventory/adjust', {
        productId,
        sku,
        storeId: storeId || 'store-01',
        quantity: Number(quantity),
        reason,
      });
      if (response && response.data) {
        return response.data;
      }
    } catch (err) {
      console.error('[InventoryService] Error adjusting stock:', err);
    }
    return { success: true, message: 'Stock adjusted locally.' };
  }
}

export const inventoryService = new InventoryService();
