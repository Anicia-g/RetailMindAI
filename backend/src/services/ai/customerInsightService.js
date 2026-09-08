const Customer = require('../../models/Customer');
const CustomerSegment = require('../../models/CustomerSegment');
const Order = require('../../models/Order');
const Product = require('../../models/Product');

class CustomerInsightService {
  /**
   * Action strategies mapping for K-Means RFM Clusters
   */
  getSegmentStrategy(segmentName) {
    const strategies = {
      VIP: {
        strategy: 'VIP Concierge & High-Value Retention',
        action: 'Assign Dedicated Store Specialist, Early Access to Fresh Artisanal Batches, 2x SmartCoins Multiplier',
        priority: 'CRITICAL',
        suggestedOffer: '10% OFF on Specialty & Gourmet (Code: VIPCHAMP)',
        engagementChannel: 'WhatsApp Direct & Dedicated Concierge',
        retentionRisk: 'Low (High LTV Asset)',
      },
      Loyal: {
        strategy: 'Habitual Restock & Frequency Reinforcement',
        action: 'Send Morning Fresh Milk & Sourdough automated restock alerts, 10% repeat purchase bonus',
        priority: 'HIGH',
        suggestedOffer: '10% OFF Routine Restock (Code: LOYAL10)',
        engagementChannel: 'WhatsApp & Push Notifications',
        retentionRisk: 'Low to Moderate',
      },
      Growing: {
        strategy: 'Basket Expansion & Cross-Category Exploration',
        action: 'Incentivize multi-category checkout (e.g., Bakery bundle with Dairy orders for ₹50 off)',
        priority: 'HIGH',
        suggestedOffer: '₹50 OFF on orders above ₹600 (Code: GROW50)',
        engagementChannel: 'App Push & In-App Banner',
        retentionRisk: 'Moderate',
      },
      'At Risk': {
        strategy: 'Churn Prevention & Win-Back Re-engagement',
        action: 'Trigger urgent "We Miss You" WhatsApp voucher with 15% discount on previously favored SKUs',
        priority: 'CRITICAL',
        suggestedOffer: '15% OFF Re-engagement Voucher (Code: COMEBACK15)',
        engagementChannel: 'WhatsApp Automated Reactivation',
        retentionRisk: 'High (Imminent Churn Window)',
      },
      Inactive: {
        strategy: 'Win-Back Campaign & Steep Elasticity Voucher',
        action: 'Deploy high-incentive 20% discount on staple essentials with zero minimum delivery fee',
        priority: 'MEDIUM',
        suggestedOffer: '20% OFF Welcome Back Deal (Code: WELCOMEBACK20)',
        engagementChannel: 'SMS & WhatsApp Broadcast',
        retentionRisk: 'Very High (Dormant Customer)',
      },
      Occasional: {
        strategy: 'Frequency Conversion & Habit Formation',
        action: 'Offer time-sensitive 5% voucher valid on next order placed within 5 days',
        priority: 'MEDIUM',
        suggestedOffer: '5% OFF Quick Repeat Voucher (Code: FRESH05)',
        engagementChannel: 'In-App Cart Trigger',
        retentionRisk: 'Moderate',
      },
    };

    return (
      strategies[segmentName] || {
        strategy: 'General Customer Nurturing',
        action: 'Deliver seasonal catalog updates and weekend fresh grocery highlights',
        priority: 'LOW',
        suggestedOffer: '10% OFF Supermarket Welcome (Code: FRESH10)',
        engagementChannel: 'Email & App Feed',
        retentionRisk: 'Normal',
      }
    );
  }

  /**
   * Generates enterprise-wide customer segment diagnostics and actionable campaigns
   */
  async getSegmentInsights() {
    const [segments, totalCustomers] = await Promise.all([
      CustomerSegment.find({ bit_IsActive: true }).lean(),
      Customer.countDocuments({ bit_IsActive: true }),
    ]);

    const distribution = {
      VIP: { count: 0, totalRevenue: 0, customers: [] },
      Loyal: { count: 0, totalRevenue: 0, customers: [] },
      Growing: { count: 0, totalRevenue: 0, customers: [] },
      'At Risk': { count: 0, totalRevenue: 0, customers: [] },
      Inactive: { count: 0, totalRevenue: 0, customers: [] },
      Occasional: { count: 0, totalRevenue: 0, customers: [] },
    };

    let totalSegmentedSpend = 0;

    segments.forEach((s) => {
      const seg = s.segment || 'Occasional';
      if (!distribution[seg]) {
        distribution[seg] = { count: 0, totalRevenue: 0, customers: [] };
      }
      distribution[seg].count++;
      distribution[seg].totalRevenue += s.monetary || 0;
      totalSegmentedSpend += s.monetary || 0;

      if (distribution[seg].customers.length < 5) {
        distribution[seg].customers.push({
          customerId: s.customerId,
          name: s.customerName,
          recencyDays: s.recency,
          frequency: s.frequency,
          monetary: s.monetary,
        });
      }
    });

    const segmentCards = Object.keys(distribution).map((segName) => {
      const data = distribution[segName];
      const strategyInfo = this.getSegmentStrategy(segName);
      const percentage = totalCustomers > 0 ? Math.round((data.count / totalCustomers) * 100) : 0;
      const revenueShare = totalSegmentedSpend > 0 ? Math.round((data.totalRevenue / totalSegmentedSpend) * 100) : 0;

      return {
        segment: segName,
        customerCount: data.count,
        percentageOfBase: percentage,
        totalRevenue: Math.round(data.totalRevenue),
        revenueSharePct: revenueShare,
        strategy: strategyInfo.strategy,
        recommendedAction: strategyInfo.action,
        suggestedOffer: strategyInfo.suggestedOffer,
        priority: strategyInfo.priority,
        engagementChannel: strategyInfo.engagementChannel,
        retentionRisk: strategyInfo.retentionRisk,
        sampleCustomers: data.customers,
      };
    });

    return {
      totalCustomers,
      totalSegmentedRevenue: Math.round(totalSegmentedSpend),
      segments: segmentCards,
      generatedDate: new Date(),
    };
  }

  /**
   * Generates actionable intelligence for a single customer profile
   */
  async getIndividualCustomerInsight(customerId) {
    const [customer, segmentDoc, recentOrders] = await Promise.all([
      Customer.findOne({ customerId, bit_IsActive: true }).lean(),
      CustomerSegment.findOne({ customerId, bit_IsActive: true }).lean(),
      Order.find({ customerId, bit_IsActive: true }).sort({ createdAt: -1 }).limit(10).lean(),
    ]);

    if (!customer) {
      throw new Error(`Customer with ID ${customerId} not found`);
    }

    const segmentName = segmentDoc?.segment || 'Loyal';
    const strategy = this.getSegmentStrategy(segmentName);

    // Calculate favorite categories from past orders
    const categoryCounts = {};
    recentOrders.forEach((o) => {
      (o.items || []).forEach((item) => {
        const cat = item.category || 'Groceries';
        categoryCounts[cat] = (categoryCounts[cat] || 0) + (item.quantity || 1);
      });
    });

    const topCategories = Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([cat, qty]) => ({ category: cat, itemsPurchased: qty }))
      .slice(0, 3);

    return {
      customerId: customer.customerId,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      totalOrders: customer.totalOrders || recentOrders.length,
      totalSpent: customer.totalSpent || 0,
      smartCoins: customer.smartCoins || 0,
      segment: segmentName,
      rfmMetrics: {
        recencyDays: segmentDoc?.recency || 4,
        frequency: segmentDoc?.frequency || recentOrders.length,
        monetary: segmentDoc?.monetary || customer.totalSpent || 0,
        cluster: segmentDoc?.cluster !== undefined ? segmentDoc.cluster : 1,
      },
      strategy: strategy.strategy,
      recommendedAction: strategy.action,
      suggestedOffer: strategy.suggestedOffer,
      topCategories,
      recentOrdersCount: recentOrders.length,
      lastOrderDate: recentOrders[0]?.createdAt || customer.lastVisit || new Date(),
    };
  }

  /**
   * Customer-Facing Personalized Intelligence (STRICT PRIVACY GUARD: No internal margins, cost prices, suppliers, or seller data)
   */
  async getCustomerPersonalizedFeed(customerId) {
    const customer = await Customer.findOne({ customerId, bit_IsActive: true }).lean();
    const recentOrders = await Order.find({ customerId, bit_IsActive: true }).sort({ createdAt: -1 }).limit(5).lean();

    // Extract preferred category
    const categorySet = new Set(['Dairy & Eggs', 'Bakery & Snacks']);
    recentOrders.forEach((o) => {
      (o.items || []).forEach((i) => {
        if (i.category) categorySet.add(i.category);
      });
    });

    const targetCategories = Array.from(categorySet);

    // Fetch popular products in these categories
    const recommendedProducts = await Product.find({
      category: { $in: targetCategories },
      bit_IsActive: true,
      stock: { $gt: 0 },
    })
      .select('productId name category price originalPrice discountPct image rating reviews badge')
      .limit(6)
      .lean();

    return {
      customerName: customer?.name || 'Valued Customer',
      smartCoinsBalance: customer?.smartCoins || 120,
      activeOffers: [
        {
          title: 'Morning Breakfast Bundle',
          code: 'FRESH15',
          discountPct: 15,
          description: 'Get 15% off Farm Fresh Milk & Whole Wheat Sourdough.',
          validTill: 'Today, 11:59 PM',
        },
        {
          title: 'Dairy & Probiotics Deal',
          code: 'DAIRY10',
          discountPct: 10,
          description: '10% off all Greek Yogurts and Organic Oat Milks.',
          validTill: 'Tomorrow',
        },
      ],
      recommendedProducts,
      suggestedRecipes: [
        {
          name: 'Creamy Garlic & Fresh Herb Pasta',
          cookTime: '20 mins',
          rating: '4.9 ⭐',
          ingredients: ['Artisan Sourdough Loaf', 'Farm Fresh Whole Milk', 'Organic Extra Virgin Olive Oil'],
        },
      ],
    };
  }
}

module.exports = new CustomerInsightService();
