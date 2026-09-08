import { initialCustomers, initialCustomerClusters } from '@/data/customers';
import { apiClient } from '@/lib/apiClient';

/**
 * Customer Intelligence Service
 * Consumes RFM and K-Means segmentation outputs and provides role-isolated customer views.
 */
class CustomerService {
  constructor() {
    this.customers = [...initialCustomers];
    this.clusters = [...initialCustomerClusters];
  }

  async getAllCustomers(filters = {}) {
    try {
      const response = await apiClient.get('/customers', filters);
      if (response && response.data) {
        return response.data;
      }
    } catch (err) {}

    let list = [...this.customers];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.phone.includes(q)
      );
    }

    if (filters.store && filters.store !== 'All') {
      list = list.filter(
        (c) => c.preferredStore?.includes(filters.store) || c.storeId === filters.store
      );
    }

    if (filters.segment && filters.segment !== 'All') {
      list = list.filter(
        (c) => c.segment === filters.segment || c.cluster?.includes(filters.segment)
      );
    }

    return list;
  }

  async getStoreCustomers(storeIdOrName) {
    if (!storeIdOrName) return this.customers;
    return this.customers.filter(
      (c) =>
        c.storeId === storeIdOrName ||
        c.preferredStore?.toLowerCase().includes(String(storeIdOrName).toLowerCase())
    );
  }

  async getBestCustomerAnalytics(storeIdOrName) {
    try {
      const response = await apiClient.get('/seller/best-customer', { storeId: storeIdOrName });
      if (response && response.data) {
        return response.data;
      }
    } catch (err) {}

    const storeCustomers = await this.getStoreCustomers(storeIdOrName);
    if (storeCustomers.length === 0) return null;

    // 1. Top Customer (highest overall rank / monetary)
    const sortedBySpend = [...storeCustomers].sort((a, b) => b.totalSpent - a.totalSpent);
    const topCustomer = sortedBySpend[0];

    // 2. Most Frequent Customer (highest orders count)
    const sortedByFrequency = [...storeCustomers].sort((a, b) => b.orders - a.orders);
    const mostFrequent = sortedByFrequency[0];

    // 3. Highest Spending Customer
    const highestSpending = sortedBySpend[0];

    // 4. Most Recent High-Value Customer (lowest recencyDays with high spend)
    const recentHighValue =
      [...storeCustomers]
        .filter((c) => c.segment === 'VIP' || c.totalSpent >= 50000)
        .sort((a, b) => a.recencyDays - b.recencyDays)[0] || sortedBySpend[0];

    // 5. At-Risk Valuable Customer (high spend, high recencyDays)
    const atRiskCustomer =
      [...storeCustomers]
        .filter((c) => c.segment === 'At Risk' || c.recencyDays >= 30)
        .sort((a, b) => b.totalSpent - a.totalSpent)[0] || {
        name: 'Priya Sundaram',
        totalSpent: 59800,
        recencyDays: 45,
        orders: 19,
        segment: 'At Risk',
        reason: 'Previously ₹59,800 spent. No purchase in 45 days.',
      };

    return {
      topCustomer,
      mostFrequent,
      highestSpending,
      recentHighValue,
      atRiskCustomer,
      totalStoreCustomers: storeCustomers.length,
      avgStoreAOV: Math.round(
        storeCustomers.reduce((acc, c) => acc + c.aov, 0) / storeCustomers.length
      ),
      storeLTV: storeCustomers.reduce((acc, c) => acc + c.totalSpent, 0),
    };
  }

  async getCustomerById(id) {
    try {
      const response = await apiClient.get(`/customers/${id}`);
      if (response && response.data) {
        return response.data;
      }
    } catch (err) {}

    return this.customers.find((c) => c.id === id || c.customerId === id) || null;
  }

  async createCustomer(customerData) {
    try {
      const response = await apiClient.post('/customers', customerData);
      if (response && response.data) {
        return response.data;
      }
    } catch (err) {
      console.error('[CustomerService] Error creating customer:', err);
    }
    const newCust = {
      id: `cust-${Date.now().toString().slice(-4)}`,
      customerId: `cust-${Date.now().toString().slice(-4)}`,
      ...customerData,
    };
    this.customers.unshift(newCust);
    return newCust;
  }

  async updateCustomer(id, customerData) {
    try {
      const response = await apiClient.put(`/customers/${id}`, customerData);
      if (response && response.data) {
        return response.data;
      }
    } catch (err) {
      console.error('[CustomerService] Error updating customer:', err);
    }
    this.customers = this.customers.map((c) => (c.id === id || c.customerId === id ? { ...c, ...customerData } : c));
    return { id, ...customerData };
  }

  async deleteCustomer(id) {
    try {
      return await apiClient.delete(`/customers/${id}`);
    } catch (err) {
      console.error('[CustomerService] Error deleting customer:', err);
      this.customers = this.customers.filter((c) => c.id !== id && c.customerId !== id);
      return { success: true, message: 'Deleted locally.' };
    }
  }

  async getCustomerClusters() {
    try {
      const response = await apiClient.get('/customers/clusters');
      if (response && response.data) {
        return response.data;
      }
    } catch (err) {}

    return this.clusters;
  }
}

export const customerService = new CustomerService();
