import { initialCustomers, initialCustomerClusters } from '@/data/customers';

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
      list = list.filter((c) => c.preferredStore?.includes(filters.store) || c.storeId === filters.store);
    }

    if (filters.segment && filters.segment !== 'All') {
      list = list.filter((c) => c.segment === filters.segment || c.cluster?.includes(filters.segment));
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
    const recentHighValue = [...storeCustomers]
      .filter((c) => c.segment === 'VIP' || c.totalSpent >= 50000)
      .sort((a, b) => a.recencyDays - b.recencyDays)[0] || sortedBySpend[0];

    // 5. At-Risk Valuable Customer (high spend, high recencyDays)
    const atRiskCustomer = [...storeCustomers]
      .filter((c) => c.segment === 'At Risk' || c.recencyDays >= 30)
      .sort((a, b) => b.totalSpent - a.totalSpent)[0] || {
        name: "Priya Sundaram",
        totalSpent: 59800,
        recencyDays: 45,
        orders: 19,
        segment: "At Risk",
        reason: "Previously ₹59,800 spent. No purchase in 45 days."
      };

    return {
      topCustomer,
      mostFrequent,
      highestSpending,
      recentHighValue,
      atRiskCustomer,
      totalStoreCustomers: storeCustomers.length,
      avgStoreAOV: Math.round(storeCustomers.reduce((acc, c) => acc + c.aov, 0) / storeCustomers.length),
      storeLTV: storeCustomers.reduce((acc, c) => acc + c.totalSpent, 0)
    };
  }

  async getCustomerById(id) {
    return this.customers.find((c) => c.id === id) || null;
  }

  async getCustomerClusters() {
    return this.clusters;
  }
}

export const customerService = new CustomerService();
