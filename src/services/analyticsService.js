import { apiClient } from '@/lib/apiClient';
import { initialAnalytics } from '@/data/analytics';

class AnalyticsService {
  async getAdminDashboard() {
    try {
      const response = await apiClient.get('/admin/dashboard');
      if (response && response.data) {
        return response.data;
      }
    } catch (err) {
      console.warn('[AnalyticsService] /admin/dashboard API unavailable, using local fallback:', err.message);
    }
    return {
      kpis: initialAnalytics.kpis,
      revenueTrendMonthly: initialAnalytics.revenueTrendMonthly,
      categoryPerformance: initialAnalytics.categoryPerformance,
      storePerformance: initialAnalytics.storePerformance,
      paymentMethodDistribution: initialAnalytics.paymentMethodDistribution,
    };
  }

  async getRevenueAnalytics(filters = {}) {
    try {
      const response = await apiClient.get('/analytics/revenue', filters);
      if (response && response.data) return response.data;
    } catch (err) {
      console.warn('[AnalyticsService] /analytics/revenue API unavailable:', err.message);
    }
    return null;
  }

  async getSalesAnalytics(filters = {}) {
    try {
      const response = await apiClient.get('/analytics/sales', filters);
      if (response && response.data) {
        return response.data;
      }
    } catch (err) {
      console.warn('[AnalyticsService] /analytics/sales API unavailable, using local fallback:', err.message);
    }
    return initialAnalytics;
  }

  async getCategoryAnalytics(filters = {}) {
    try {
      const response = await apiClient.get('/analytics/categories', filters);
      if (response && response.data) return response.data;
    } catch (err) {
      console.warn('[AnalyticsService] /analytics/categories API unavailable:', err.message);
    }
    return [];
  }

  async getStoreAnalytics(filters = {}) {
    try {
      const response = await apiClient.get('/analytics/stores', filters);
      if (response && response.data) return response.data;
    } catch (err) {
      console.warn('[AnalyticsService] /analytics/stores API unavailable:', err.message);
    }
    return [];
  }

  async getPaymentAnalytics(filters = {}) {
    try {
      const response = await apiClient.get('/analytics/payments', filters);
      if (response && response.data) return response.data;
    } catch (err) {
      console.warn('[AnalyticsService] /analytics/payments API unavailable:', err.message);
    }
    return [];
  }

  async getInventoryAnalytics(storeId = null) {
    try {
      const response = await apiClient.get('/analytics/inventory', storeId ? { storeId } : null);
      if (response && response.data) return response.data;
    } catch (err) {
      console.warn('[AnalyticsService] /analytics/inventory API unavailable:', err.message);
    }
    return null;
  }

  async getSellerAnalytics(filters = {}) {
    try {
      const response = await apiClient.get('/analytics/sellers', filters);
      if (response && response.data) return response.data;
    } catch (err) {
      console.warn('[AnalyticsService] /analytics/sellers API unavailable:', err.message);
    }
    return [];
  }

  async getCustomerRFM(storeId = null) {
    try {
      const response = await apiClient.get('/analytics/customers/rfm', storeId ? { storeId } : null);
      if (response && response.data) return response.data;
    } catch (err) {
      console.warn('[AnalyticsService] /analytics/customers/rfm API unavailable:', err.message);
    }
    return [];
  }

  async getTopCustomers(storeId = null, limit = 10, sortBy = 'monetary') {
    try {
      const params = { limit, sortBy };
      if (storeId) params.storeId = storeId;
      const response = await apiClient.get('/analytics/customers/top', params);
      if (response && response.data) return response.data;
    } catch (err) {
      console.warn('[AnalyticsService] /analytics/customers/top API unavailable:', err.message);
    }
    return [];
  }

  async getDemandHistory(productId, storeId = null, days = 30) {
    try {
      const params = { days };
      if (storeId) params.storeId = storeId;
      const response = await apiClient.get(`/analytics/products/${productId}/demand-history`, params);
      if (response && response.data) return response.data;
    } catch (err) {
      console.warn(`[AnalyticsService] /analytics/products/${productId}/demand-history API unavailable:`, err.message);
    }
    return null;
  }

  async getInventoryRiskFeatures(storeId = null) {
    try {
      const response = await apiClient.get('/analytics/inventory/risk-features', storeId ? { storeId } : null);
      if (response && response.data) return response.data;
    } catch (err) {
      console.warn('[AnalyticsService] /analytics/inventory/risk-features API unavailable:', err.message);
    }
    return [];
  }

  async getDiscountFeatures(storeId = null) {
    try {
      const response = await apiClient.get('/analytics/products/discount-features', storeId ? { storeId } : null);
      if (response && response.data) return response.data;
    } catch (err) {
      console.warn('[AnalyticsService] /analytics/products/discount-features API unavailable:', err.message);
    }
    return [];
  }

  async getDataQualityAudit() {
    try {
      const response = await apiClient.get('/analytics/data-quality');
      if (response && response.data) return response.data;
    } catch (err) {
      console.warn('[AnalyticsService] /analytics/data-quality API unavailable:', err.message);
    }
    return null;
  }

  async getCustomerAnalytics() {
    return this.getCustomerRFM();
  }

  async getInventoryRisk(storeId = null) {
    try {
      const response = await apiClient.get('/ml/inventory-risk', storeId ? { storeId } : null);
      if (response && response.data) {
        return response.data;
      }
    } catch (err) {
      console.warn('[AnalyticsService] /ml/inventory-risk API unavailable:', err.message);
    }
    return null;
  }
}

export const analyticsService = new AnalyticsService();

