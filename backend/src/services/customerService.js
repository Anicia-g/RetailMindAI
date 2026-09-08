const Customer = require('../models/Customer');
const Order = require('../models/Order');

class CustomerService {
  async getAllCustomers(filters = {}) {
    const query = { bit_IsActive: true };

    if (filters.search) {
      const q = filters.search.trim();
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { phone: { $regex: q, $options: 'i' } },
      ];
    }

    if (filters.store && filters.store !== 'All') {
      query.$or = [
        { preferredStore: { $regex: filters.store, $options: 'i' } },
        { storeId: filters.store },
      ];
    }

    if (filters.segment && filters.segment !== 'All') {
      query.$or = [
        { segment: filters.segment },
        { cluster: { $regex: filters.segment, $options: 'i' } },
      ];
    }

    const customers = await Customer.find(query).sort({ totalSpent: -1 });
    return customers;
  }

  async getStoreCustomers(storeIdOrName) {
    if (!storeIdOrName || storeIdOrName === 'All') {
      return await Customer.find({ bit_IsActive: true });
    }

    const cleanStore = String(storeIdOrName).trim();
    return await Customer.find({
      bit_IsActive: true,
      $or: [
        { storeId: cleanStore },
        { preferredStore: { $regex: cleanStore, $options: 'i' } },
      ],
    });
  }

  async getCustomerById(id) {
    return await Customer.findOne({
      $or: [{ customerId: id }, { email: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
      bit_IsActive: true,
    });
  }

  async createCustomer(data, user = null) {
    const customerId = data.customerId || `cust-${Date.now()}`;
    return await Customer.create({
      ...data,
      customerId,
      txt_Created_By: user?.name || 'system',
    });
  }

  async updateCustomer(id, data, user = null) {
    const customer = await Customer.findOneAndUpdate(
      {
        $or: [{ customerId: id }, { email: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
      },
      {
        ...data,
        txt_Modified_By: user?.name || 'system',
        dte_Modified_Date: new Date(),
      },
      { new: true, runValidators: true }
    );

    if (!customer) {
      throw new Error(`Customer '${id}' not found.`);
    }

    return customer;
  }

  async deleteCustomer(id, user = null) {
    const customer = await Customer.findOneAndUpdate(
      {
        $or: [{ customerId: id }, { email: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
      },
      {
        bit_IsActive: false,
        txt_Modified_By: user?.name || 'system',
        dte_Modified_Date: new Date(),
      },
      { new: true }
    );

    if (!customer) {
      throw new Error(`Customer '${id}' not found.`);
    }

    return { message: 'Customer removed successfully.' };
  }

  async getBestCustomerAnalytics(storeIdOrName = 'store-01') {
    const storeCustomers = await this.getStoreCustomers(storeIdOrName);
    if (!storeCustomers || storeCustomers.length === 0) {
      // Return fallback demo profile
      return {
        topCustomer: {
          name: 'Vikram Malhotra',
          email: 'vikram.m@techcorp.in',
          phone: '+91 98450 11234',
          totalSpent: 184500,
          orders: 34,
          aov: 5426,
          segment: 'VIP',
          recencyDays: 2,
        },
        mostFrequent: {
          name: 'Meena Krishnan',
          totalSpent: 48900,
          orders: 38,
          aov: 1286,
          segment: 'Loyal',
        },
        highestSpending: {
          name: 'Vikram Malhotra',
          totalSpent: 184500,
          orders: 34,
          aov: 5426,
          segment: 'VIP',
        },
        recentHighValue: {
          name: 'Ananya Iyer',
          totalSpent: 68420,
          orders: 26,
          aov: 2631,
          segment: 'VIP',
          recencyDays: 1,
        },
        atRiskCustomer: {
          name: 'Priya Sundaram',
          totalSpent: 59800,
          orders: 19,
          recencyDays: 45,
          segment: 'At Risk',
          reason: 'Previously ₹59,800 spent. No purchase in 45 days.',
        },
        totalStoreCustomers: 5,
        avgStoreAOV: 3200,
        storeLTV: 420000,
      };
    }

    // 1. Top Customer (highest overall monetary)
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

    const totalLTV = storeCustomers.reduce((acc, c) => acc + (c.totalSpent || 0), 0);
    const avgAOV = Math.round(
      storeCustomers.reduce((acc, c) => acc + (c.aov || 0), 0) / storeCustomers.length
    );

    return {
      topCustomer,
      mostFrequent,
      highestSpending,
      recentHighValue,
      atRiskCustomer,
      totalStoreCustomers: storeCustomers.length,
      avgStoreAOV: avgAOV,
      storeLTV: totalLTV,
    };
  }

  async getCustomerClusters() {
    const customers = await Customer.find({ bit_IsActive: true });
    
    // Group customers by segment
    const clusterMap = {
      'Cluster 1: High Value Champions': {
        name: 'Cluster 1: High Value Champions',
        segment: 'VIP',
        badge: 'High Value Champions',
        badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
        count: 0,
        avgSpend: '₹1.26L',
        avgOrders: 30,
        recency: '1.5 days',
        topCategories: ['Dairy & Eggs', 'Bakery & Snacks', 'Groceries & Gourmet'],
        description: 'Frequent buyers with highest basket value and maximum platform loyalty.',
        action: 'Reward with VIP double SmartCoins & early gourmet releases.',
        members: [],
      },
      'Cluster 2: Loyal Regulars': {
        name: 'Cluster 2: Loyal Regulars',
        segment: 'Loyal',
        badge: 'Loyal Regulars',
        badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
        count: 0,
        avgSpend: '₹48.9K',
        avgOrders: 38,
        recency: '0.5 days',
        topCategories: ['Dairy & Eggs', 'Fresh Bakery', 'Rice & Grains'],
        description: 'Highest weekly store visit frequency. Daily household grocery shoppers.',
        action: 'Automated weekly replenishment baskets with 5% recurring discount.',
        members: [],
      },
      'Cluster 3: Mid-Tier Growth': {
        name: 'Cluster 3: Mid-Tier Growth',
        segment: 'Growing',
        badge: 'Mid-Tier Growth',
        badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
        count: 0,
        avgSpend: '₹22.4K',
        avgOrders: 14,
        recency: '4.2 days',
        topCategories: ['Electronics & Tech', 'Home & Lifestyle'],
        description: 'High basket value per transaction but lower visit cadence.',
        action: 'Category cross-selling campaigns for pantry & daily staples.',
        members: [],
      },
      'Cluster 4: At-Risk Lapsed': {
        name: 'Cluster 4: At-Risk Lapsed',
        segment: 'At Risk',
        badge: 'At-Risk Lapsed',
        badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
        count: 0,
        avgSpend: '₹59.8K',
        avgOrders: 19,
        recency: '45 days',
        topCategories: ['Groceries & Gourmet', 'Tech Accessories'],
        description: 'Previously high lifetime value with no purchases in the last 30+ days.',
        action: 'Send high-incentive personalized WhatsApp win-back coupon (₹250 off).',
        members: [],
      },
    };

    for (const c of customers) {
      const clusterKey = c.cluster || (c.segment === 'VIP' ? 'Cluster 1: High Value Champions' : c.segment === 'Loyal' ? 'Cluster 2: Loyal Regulars' : c.segment === 'At Risk' ? 'Cluster 4: At-Risk Lapsed' : 'Cluster 3: Mid-Tier Growth');
      if (clusterMap[clusterKey]) {
        clusterMap[clusterKey].count += 1;
        clusterMap[clusterKey].members.push({
          id: c.customerId,
          name: c.name,
          email: c.email,
          totalSpent: c.totalSpent,
          orders: c.orders,
          recencyDays: c.recencyDays,
        });
      }
    }

    return Object.values(clusterMap);
  }

  async getPreferences(customerIdOrEmail) {
    const customer = await this.getCustomerById(customerIdOrEmail);
    if (!customer) {
      return { whatsappOffers: true, emailUpdates: true, smsNotifications: false };
    }
    return customer.preferences || { whatsappOffers: true, emailUpdates: true, smsNotifications: false };
  }

  async updatePreferences(customerIdOrEmail, preferences = {}, user = null) {
    const customer = await this.getCustomerById(customerIdOrEmail);
    if (!customer) {
      throw new Error(`Customer ${customerIdOrEmail} not found`);
    }
    customer.preferences = {
      ...customer.preferences,
      ...preferences,
    };
    customer.txt_Modified_By = user?.email || 'system';
    customer.dte_Modified_Date = new Date();
    await customer.save();
    return customer.preferences;
  }
}

module.exports = new CustomerService();
