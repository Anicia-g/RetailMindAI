import { apiClient } from '@/lib/apiClient';

class ReportService {
  async getSalesReport() {
    try {
      const response = await apiClient.get('/reports/sales');
      if (response && response.data) return response.data;
    } catch (e) {
      console.warn('[ReportService] Sales report API unavailable:', e.message);
    }
    return null;
  }

  async getInventoryReport() {
    try {
      const response = await apiClient.get('/reports/inventory');
      if (response && response.data) return response.data;
    } catch (e) {
      console.warn('[ReportService] Inventory report API unavailable:', e.message);
    }
    return null;
  }

  async getCustomersReport() {
    try {
      const response = await apiClient.get('/reports/customers');
      if (response && response.data) return response.data;
    } catch (e) {
      console.warn('[ReportService] Customers report API unavailable:', e.message);
    }
    return null;
  }

  async getSuppliersReport() {
    try {
      const response = await apiClient.get('/reports/suppliers');
      if (response && response.data) return response.data;
    } catch (e) {
      console.warn('[ReportService] Suppliers report API unavailable:', e.message);
    }
    return null;
  }

  async getPurchasesReport() {
    try {
      const response = await apiClient.get('/reports/purchases');
      if (response && response.data) return response.data;
    } catch (e) {
      console.warn('[ReportService] Purchases report API unavailable:', e.message);
    }
    return null;
  }
}

export const reportService = new ReportService();
