import { apiClient } from '@/lib/apiClient';
import { initialEmployees } from '@/data/employees';

class SellerService {
  async getAllSellers() {
    try {
      const response = await apiClient.get('/sellers');
      if (response && response.data && response.data.length > 0) {
        return response.data;
      }
    } catch (err) {
      console.warn('[SellerService] API unavailable, using local fallback:', err.message);
    }
    return initialEmployees;
  }

  async getSellerById(id) {
    try {
      const response = await apiClient.get(`/sellers/${id}`);
      if (response && response.data) {
        return response.data;
      }
    } catch (err) {
      console.warn('[SellerService] API unavailable for seller id:', id);
    }
    return initialEmployees.find((e) => e.id === id || e.email === id) || null;
  }

  async createSeller(sellerData) {
    try {
      const response = await apiClient.post('/sellers', sellerData);
      if (response && response.data) {
        return response.data;
      }
    } catch (err) {
      console.error('[SellerService] Error creating seller:', err);
    }
    return { id: `emp-${Date.now()}`, ...sellerData };
  }

  async updateSeller(id, sellerData) {
    try {
      const response = await apiClient.put(`/sellers/${id}`, sellerData);
      if (response && response.data) {
        return response.data;
      }
    } catch (err) {
      console.error('[SellerService] Error updating seller:', err);
    }
    return { id, ...sellerData };
  }

  async getSellerDashboard() {
    try {
      const response = await apiClient.get('/seller/dashboard');
      if (response && response.data) {
        return response.data;
      }
    } catch (err) {
      console.warn('[SellerService] /seller/dashboard API unavailable, using local fallback:', err.message);
    }
    return null;
  }

  async getSellerAnalytics() {
    try {
      const response = await apiClient.get('/seller/analytics');
      if (response && response.data) {
        return response.data;
      }
    } catch (err) {
      console.warn('[SellerService] /seller/analytics API unavailable, using local fallback:', err.message);
    }
    return null;
  }

  async getSellerBestSellers() {
    try {
      const response = await apiClient.get('/seller/best-sellers');
      if (response && response.data) {
        return response.data;
      }
    } catch (err) {
      console.warn('[SellerService] /seller/best-sellers API unavailable:', err.message);
    }
    return null;
  }
}

export const sellerService = new SellerService();
