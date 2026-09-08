const Customer = require('../models/Customer');
const Order = require('../models/Order');

class CustomerAnalyticsService {
  /**
   * Calculate quintile/rule score (1-5) for Recency
   * 5 = most recent (highest engagement), 1 = least recent
   */
  scoreRecency(days) {
    const d = Math.max(0, Number(days) || 0);
    if (d <= 3) return 5;
    if (d <= 14) return 4;
    if (d <= 30) return 3;
    if (d <= 60) return 2;
    return 1;
  }

  /**
   * Calculate score (1-5) for Frequency
   * 5 = most frequent orders, 1 = single order
   */
  scoreFrequency(count) {
    const c = Math.max(0, Number(count) || 0);
    if (c >= 25) return 5;
    if (c >= 12) return 4;
    if (c >= 5) return 3;
    if (c >= 2) return 2;
    return 1;
  }

  /**
   * Calculate score (1-5) for Monetary Value
   * 5 = highest spend, 1 = entry level spend
   */
  scoreMonetary(amount) {
    const a = Math.max(0, Number(amount) || 0);
    if (a >= 50000) return 5;
    if (a >= 20000) return 4;
    if (a >= 8000) return 3;
    if (a >= 2500) return 2;
    return 1;
  }

  /**
   * Suggest business segment based on RFM scores
   */
  suggestSegment(r, f, m) {
    if (r >= 4 && f >= 4 && m >= 4) return 'VIP Champions';
    if (r >= 3 && f >= 3) return 'Loyal Regulars';
    if (r >= 4 && f <= 2) return 'New Potential Regulars';
    if (r <= 2 && f >= 3 && m >= 3) return 'At Risk VIPs';
    if (r <= 2 && f <= 2) return 'Lapsed / Dormant';
    return 'Growing Regulars';
  }

  /**
   * GET /api/analytics/customers/rfm
   * Feature engineering calculating real Recency, Frequency, and Monetary parameters from orders
   */
  async getCustomerRFM(storeId = null) {
    const orderMatch = {
      bit_IsActive: true,
      status: { $in: ['Completed', 'Delivered'] },
    };

    if (storeId && storeId !== 'All' && storeId !== 'all') {
      orderMatch.$or = [{ storeId }, { store: new RegExp(storeId, 'i') }];
    }

    // 1. Aggregate real order history per customer
    const orderRFMAgg = await Order.aggregate([
      { $match: orderMatch },
      {
        $group: {
          _id: '$customerId',
          customerName: { $first: '$customerName' },
          totalSpent: { $sum: '$totalAmount' },
          totalOrders: { $sum: 1 },
          lastPurchaseDate: { $max: '$createdAt' },
          firstPurchaseDate: { $min: '$createdAt' },
          paymentMethodsUsed: { $addToSet: '$paymentMethod' },
        },
      },
    ]);

    // 2. Fetch customer collection profiles to match
    const customerProfiles = await Customer.find({ bit_IsActive: true });
    const profileMap = new Map();
    customerProfiles.forEach((c) => {
      profileMap.set(c.customerId, c);
      if (c.email) profileMap.set(c.email, c);
    });

    const now = Date.now();
    const rfmResults = [];

    // Process customers with order history
    const processedCustomerIds = new Set();

    for (const agg of orderRFMAgg) {
      const custId = agg._id || 'cust-001';
      processedCustomerIds.add(custId);

      const profile = profileMap.get(custId) || {};
      const lastDate = agg.lastPurchaseDate ? new Date(agg.lastPurchaseDate) : new Date();
      const recencyDays = Math.max(0, Math.floor((now - lastDate.getTime()) / (1000 * 60 * 60 * 24)));
      const frequency = agg.totalOrders || 1;
      const monetary = agg.totalSpent || 0;
      const aov = frequency > 0 ? Math.round(monetary / frequency) : monetary;

      const rScore = this.scoreRecency(recencyDays);
      const fScore = this.scoreFrequency(frequency);
      const mScore = this.scoreMonetary(monetary);
      const rfmScore = `${rScore}${fScore}${mScore}`;
      const segment = profile.segment || this.suggestSegment(rScore, fScore, mScore);

      rfmResults.push({
        customerId: custId,
        name: profile.name || agg.customerName || 'Customer',
        email: profile.email || `${custId}@customer.retailmind.ai`,
        phone: profile.phone || '+91 98000 00000',
        avatar: profile.avatar || null,
        preferredStore: profile.preferredStore || 'Indiranagar Flagship (Store 01)',
        storeId: profile.storeId || storeId || 'store-01',
        recency: recencyDays,
        recencyDays,
        frequency,
        totalOrders: frequency,
        monetary,
        totalSpent: monetary,
        aov,
        lastPurchaseDate: lastDate.toISOString().split('T')[0],
        recencyScore: rScore,
        frequencyScore: fScore,
        monetaryScore: mScore,
        rfmScore,
        segment,
        smartCoins: profile.smartCoins || Math.round(monetary * 0.01),
      });
    }

    // Add customers from database who may not have orders in current filter yet
    for (const profile of customerProfiles) {
      if (!processedCustomerIds.has(profile.customerId)) {
        const rScore = this.scoreRecency(profile.recencyDays || 30);
        const fScore = this.scoreFrequency(profile.orders || profile.frequency || 1);
        const mScore = this.scoreMonetary(profile.totalSpent || profile.monetary || 1000);

        rfmResults.push({
          customerId: profile.customerId,
          name: profile.name,
          email: profile.email,
          phone: profile.phone,
          avatar: profile.avatar,
          preferredStore: profile.preferredStore,
          storeId: profile.storeId || 'store-01',
          recency: profile.recencyDays || 30,
          recencyDays: profile.recencyDays || 30,
          frequency: profile.orders || profile.frequency || 1,
          totalOrders: profile.orders || profile.frequency || 1,
          monetary: profile.totalSpent || profile.monetary || 1000,
          totalSpent: profile.totalSpent || profile.monetary || 1000,
          aov: profile.aov || 1000,
          lastPurchaseDate: profile.lastPurchase || '2026-08-01',
          recencyScore: rScore,
          frequencyScore: fScore,
          monetaryScore: mScore,
          rfmScore: `${rScore}${fScore}${mScore}`,
          segment: profile.segment || 'Growing',
          smartCoins: profile.smartCoins || 100,
        });
      }
    }

    return rfmResults;
  }

  /**
   * GET /api/analytics/customers/top
   */
  async getTopCustomers(storeId = null, limit = 10, sortBy = 'monetary') {
    const rfmList = await this.getCustomerRFM(storeId);

    if (sortBy === 'frequency') {
      rfmList.sort((a, b) => b.frequency - a.frequency);
    } else if (sortBy === 'recency') {
      rfmList.sort((a, b) => a.recency - b.recency);
    } else {
      rfmList.sort((a, b) => b.monetary - a.monetary);
    }

    return rfmList.slice(0, Number(limit) || 10);
  }

  /**
   * Clean feature matrix for future K-Means Machine Learning clustering
   */
  async getCustomerSegmentationDataset(storeId = null) {
    const rfmList = await this.getCustomerRFM(storeId);

    return rfmList.map((c) => ({
      customerId: c.customerId,
      name: c.name,
      recency: c.recency,
      frequency: c.frequency,
      monetary: c.monetary,
      recencyScore: c.recencyScore,
      frequencyScore: c.frequencyScore,
      monetaryScore: c.monetaryScore,
      rfmScore: c.rfmScore,
      aov: c.aov,
      storeId: c.storeId,
    }));
  }
}

module.exports = new CustomerAnalyticsService();
