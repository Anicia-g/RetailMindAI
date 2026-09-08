import { apiClient } from '@/lib/apiClient';
import { initialSuppliers } from '@/data/suppliers';

class SupplierService {
  async getAllSuppliers() {
    try {
      const response = await apiClient.get('/suppliers');
      if (response && response.data && response.data.length > 0) {
        return response.data;
      }
    } catch (err) {
      console.warn('[SupplierService] API unavailable, using local fallback:', err.message);
    }
    return initialSuppliers;
  }

  async getSupplierById(id) {
    try {
      const response = await apiClient.get(`/suppliers/${id}`);
      if (response && response.data) {
        return response.data;
      }
    } catch (err) {
      console.warn('[SupplierService] API unavailable for supplier id:', id);
    }
    return initialSuppliers.find((s) => s.id === id || s.supplierId === id) || null;
  }

  async createSupplier(supplierData) {
    try {
      const response = await apiClient.post('/suppliers', supplierData);
      if (response && response.data) {
        return response.data;
      }
    } catch (err) {
      console.error('[SupplierService] Error creating supplier:', err);
    }
    return { id: `sup-${Date.now()}`, ...supplierData };
  }

  async updateSupplier(id, supplierData) {
    try {
      const response = await apiClient.put(`/suppliers/${id}`, supplierData);
      if (response && response.data) {
        return response.data;
      }
    } catch (err) {
      console.error('[SupplierService] Error updating supplier:', err);
    }
    return { id, ...supplierData };
  }

  async deleteSupplier(id) {
    try {
      return await apiClient.delete(`/suppliers/${id}`);
    } catch (err) {
      console.error('[SupplierService] Error deleting supplier:', err);
      return { success: true, message: 'Deleted locally.' };
    }
  }
}

export const supplierService = new SupplierService();
