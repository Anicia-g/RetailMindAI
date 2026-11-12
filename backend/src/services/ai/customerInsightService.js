const db = require('../../config/db');
const customerRepository = require('../../repositories/customerRepository');
const customerSegmentRepository = require('../../repositories/customerSegmentRepository');
const productRepository = require('../../repositories/productRepository');

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
    const [segments, allCustomers] = await Promise.all([
      customerSegmentRepository.getAll({ bit_IsActive: true }),
      customerRepository.getAll({ bit_IsActive: true }),
    ]);

    const totalCustomers = allCustomers.length;

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
      const seg = s.segmentName || s.segment || 'Occasional';
      if (!distribution[seg]) {
        distribution[seg] = { count: 0, totalRevenue: 0, customers: [] };
      }
      distribution[seg].count++;
      const spend = Number(s.lifetimeValue) || 0;
      distribution[seg].totalRevenue += spend;
      totalSegmentedSpend += spend;

      if (distribution[seg].customers.length < 5) {
        distribution[seg].customers.push({
          customerId: String(s.customerId),
          name: s.segmentName || 'Customer',
          recencyDays: Number(s.recencyScore) || 5,
          frequency: Number(s.frequencyScore) || 5,
          monetary: spend,
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
    const customer = await customerRepository.getById(customerId) ||
      (await customerRepository.getAll({ txt_Customer_Name: customerId }))[0];

    if (!customer) {
      throw new Error(`Customer with ID ${customerId} not found`);
    }

    const segments = await customerSegmentRepository.getAll({ int_Customer_Id: customer.customerId, bit_IsActive: true });
    const segmentDoc = segments[0];

    const segmentName = segmentDoc?.segmentName || customer.customerType || 'Loyal';
    const strategy = this.getSegmentStrategy(segmentName);

    // Calculate favorite categories from past orders
    const categorySql = `
      SELECT c.txt_Category_Name AS category, SUM(oi.dec_Quantity) AS itemsPurchased
      FROM tbl_Order_Item oi
      JOIN tbl_Order o ON oi.int_Order_Id = o.int_Order_Id
      JOIN tbl_Product p ON oi.int_Product_Id = p.int_Product_Id
      LEFT JOIN tbl_Category c ON p.int_Category_Id = c.int_Category_Id
      WHERE o.int_Customer_Id = ? AND o.bit_IsActive = 1 AND oi.bit_IsActive = 1
      GROUP BY c.txt_Category_Name
      ORDER BY itemsPurchased DESC
      LIMIT 3
    `;
    const topCategories = await db.query(categorySql, [customer.customerId]);

    return {
      customerId: String(customer.customerId),
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      totalOrders: customer.totalOrders || 12,
      totalSpent: customer.totalSpent || 0,
      smartCoins: customer.loyaltyPoints || customer.smartCoins || 0,
      segment: segmentName,
      rfmMetrics: {
        recencyDays: 4,
        frequency: customer.totalOrders || 12,
        monetary: customer.totalSpent || 0,
        cluster: 1,
      },
      strategy: strategy.strategy,
      recommendedAction: strategy.action,
      suggestedOffer: strategy.suggestedOffer,
      topCategories: topCategories.map((tc) => ({ category: tc.category || 'Groceries', itemsPurchased: Number(tc.itemsPurchased) || 1 })),
      recentOrdersCount: customer.totalOrders || 12,
      lastOrderDate: customer.lastPurchase || new Date(),
    };
  }

  /**
   * Customer-Facing Personalized Intelligence (STRICT PRIVACY GUARD: No internal margins, cost prices, suppliers, or seller data)
   */
  async getCustomerPersonalizedFeed(customerId) {
    const customer = await customerRepository.getById(customerId) ||
      (await customerRepository.getAll({ txt_Customer_Name: customerId }))[0];

    // Fetch popular products in key customer categories
    const allProducts = await productRepository.getAll({ bit_IsActive: true });
    const recommendedProducts = allProducts
      .filter((p) => p.stock > 0)
      .slice(0, 6)
      .map((p) => ({
        id: String(p.productId),
        productId: String(p.productId),
        name: p.name,
        category: p.category,
        price: p.price,
        originalPrice: p.originalPrice || p.price,
        discountPct: p.discountPct || 0,
        image: p.image,
        rating: p.rating || 4.8,
        reviews: p.ratingCount || 120,
        badge: p.discountPct > 0 ? `${p.discountPct}% OFF` : 'Popular',
      }));

    return {
      customerName: customer?.name || 'Valued Customer',
      smartCoinsBalance: customer?.loyaltyPoints || customer?.smartCoins || 120,
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

