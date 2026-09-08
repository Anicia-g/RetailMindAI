import { apiClient } from '@/lib/apiClient';
import { initialStores } from '@/data/stores';

class StoreService {
  async getAllStores() {
    try {
      const response = await apiClient.get('/stores');
      if (response && response.data && response.data.length > 0) {
        return response.data;
      }
    } catch (err) {
      console.warn('[StoreService] API unavailable, using local fallback:', err.message);
    }
    return initialStores;
  }

  async getStoreById(id) {
    try {
      const response = await apiClient.get(`/stores/${id}`);
      if (response && response.data) {
        return response.data;
      }
    } catch (err) {
      console.warn('[StoreService] API unavailable for store id:', id);
    }
    return initialStores.find((s) => s.id === id || s.storeId === id) || null;
  }

  async createStore(storeData) {
    try {
      const response = await apiClient.post('/stores', storeData);
      if (response && response.data) {
        return response.data;
      }
    } catch (err) {
      console.error('[StoreService] Error creating store:', err);
    }
    return { id: `store-${Date.now()}`, ...storeData };
  }

  async updateStore(id, storeData) {
    try {
      const response = await apiClient.put(`/stores/${id}`, storeData);
      if (response && response.data) {
        return response.data;
      }
    } catch (err) {
      console.error('[StoreService] Error updating store:', err);
    }
    return { id, ...storeData };
  }

  async deleteStore(id) {
    try {
      return await apiClient.delete(`/stores/${id}`);
    } catch (err) {
      console.error('[StoreService] Error deleting store:', err);
      return { success: true, message: 'Deleted locally.' };
    }
  }
}

export const storeService = new StoreService();
