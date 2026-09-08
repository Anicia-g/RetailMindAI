const reorderIntelligenceService = require('./reorderIntelligenceService');
const discountIntelligenceService = require('./discountIntelligenceService');
const customerInsightService = require('./customerInsightService');
const demandForecastInsightService = require('./demandForecastInsightService');
const anomalyInsightService = require('./anomalyInsightService');
const salesAnalyticsService = require('../salesAnalyticsService');
const sellerAnalyticsService = require('../sellerAnalyticsService');
const inventoryAnalyticsService = require('../inventoryAnalyticsService');
const AiRecommendation = require('../../models/AiRecommendation');

class IntelligenceService {
  /**
   * Generates comprehensive, role-scoped AI insights for dashboards and executive summaries
   */
  async getDashboardInsights({ role = 'ADMIN', storeId = null, user = null }) {
    const userRole = (role || user?.role || 'ADMIN').toUpperCase();
    const effectiveStore = userRole === 'SELLER' ? (user?.storeId || user?.store || storeId) : storeId;

    if (userRole === 'CUSTOMER') {
      const customerId = user?.id || user?.customerId || 'cust-001';
      return await customerInsightService.getCustomerPersonalizedFeed(customerId);
    }

    if (userRole === 'SELLER') {
      const [reorders, discounts, inventorySummary, sellerPerformance] = await Promise.all([
        reorderIntelligenceService.generateReorderRecommendations(effectiveStore),
        discountIntelligenceService.getDiscountCandidates(effectiveStore, 5),
        inventoryAnalyticsService.getInventorySummary(effectiveStore),
        sellerAnalyticsService.getSellerPerformance({ range: '30d', storeId: effectiveStore }),
      ]);

      const criticalAlerts = reorders.filter((r) => r.priority === 'CRITICAL' || r.priority === 'HIGH').slice(0, 5);

      return {
        role: 'SELLER',
        storeId: effectiveStore,
        storeName: user?.store || 'Assigned Store Outlet',
        healthStatus: criticalAlerts.length > 0 ? 'NEEDS_ATTENTION' : 'OPTIMAL',
        lowStockAisleAlerts: criticalAlerts,
        discountOpportunities: discounts,
        inventoryHealthBreakdown: inventorySummary?.healthDistribution || {},
        topLocalSellers: (sellerPerformance || []).slice(0, 3),
        generatedDate: new Date(),
      };
    }

    // Default: ADMIN Role (Enterprise-wide Intelligence)
    const [reorders, forecasts, customerSegments, anomalies, inventorySummary, revenueData] = await Promise.all([
      reorderIntelligenceService.generateReorderRecommendations(null),
      demandForecastInsightService.getForecastInsights(null),
      customerInsightService.getSegmentInsights(),
      anomalyInsightService.getAnomalyInsights(5),
      inventoryAnalyticsService.getInventorySummary(null),
      salesAnalyticsService.getRevenueAnalytics({ range: '30d' }),
    ]);

    const criticalReorders = reorders.filter((r) => r.priority === 'CRITICAL' || r.priority === 'HIGH').slice(0, 5);

    // Formulate top strategic executive recommendations
    const executiveRecommendations = [];

    if (criticalReorders.length > 0) {
      executiveRecommendations.push({
        type: 'INVENTORY_REPLENISHMENT',
        priority: 'CRITICAL',
        title: `${criticalReorders.length} High-Velocity SKUs Near Stockout`,
        description: `Items including ${criticalReorders.map((r) => r.productName).slice(0, 2).join(', ')} have under 2.5 days runway. Urgent PO generation recommended.`,
        actionRoute: '/purchase-orders',
        actionLabel: 'Review Reorder Queue',
      });
    }

    if (forecasts.surgingProducts > 0) {
      executiveRecommendations.push({
        type: 'DEMAND_EXPANSION',
        priority: 'HIGH',
        title: `${forecasts.surgingProducts} Products Experiencing Demand Surge`,
        description: 'Time series models indicate >12% demand lift over the next 14 days. Pre-allocate central warehouse safety buffers.',
        actionRoute: '/forecasting',
        actionLabel: 'View Forecast Horizons',
      });
    }

    const atRiskSegment = customerSegments.segments.find((s) => s.segment === 'At Risk');
    if (atRiskSegment && atRiskSegment.customerCount > 0) {
      executiveRecommendations.push({
        type: 'CUSTOMER_RETENTION',
        priority: 'HIGH',
        title: `${atRiskSegment.customerCount} High-LTV Customers at Risk of Churn`,
        description: `K-Means RFM cluster identified ${atRiskSegment.customerCount} customers with declining recency representing ₹${atRiskSegment.totalRevenue.toLocaleString()} past spend.`,
        actionRoute: '/customers',
        actionLabel: 'Deploy Win-Back Campaign',
      });
    }

    if (anomalies.unusualTransactionsCount > 0) {
      executiveRecommendations.push({
        type: 'ANOMALY_AUDIT',
        priority: 'MEDIUM',
        title: `${anomalies.unusualTransactionsCount} Unusual Transactions Flagged for Review`,
        description: 'Isolation Forest detected multi-variate price/volume deviations. Manager audit recommended.',
        actionRoute: '/analytics',
        actionLabel: 'Inspect Transaction Logs',
      });
    }

    return {
      role: 'ADMIN',
      enterpriseSummary: {
        totalRevenue: revenueData?.metrics?.totalRevenue || 0,
        growthPercentage: revenueData?.metrics?.growthPercentage || 0,
        totalInventoryValue: inventorySummary?.metrics?.totalInventoryValue || 0,
        criticalStockoutRisksCount: criticalReorders.length,
        totalCustomersSegmented: customerSegments?.totalCustomers || 0,
        unusualTransactionsCount: anomalies?.unusualTransactionsCount || 0,
      },
      topReorderRecommendations: criticalReorders,
      demandForecastSummary: {
        surgingCount: forecasts.surgingProducts,
        criticalDemandRisks: forecasts.criticalDemandRisks,
        topForecasts: (forecasts.insights || []).slice(0, 4),
      },
      customerSegments: customerSegments.segments,
      recentAnomalies: anomalies.items,
      executiveRecommendations,
      generatedDate: new Date(),
    };
  }

  /**
   * Retrieves active, persistent recommendations from tbl_AI_Recommendation
   */
  async getActiveRecommendations({ type = null, priority = null, storeId = null, limit = 20 }) {
    const query = { bit_IsActive: true, status: 'ACTIVE' };

    if (type) {
      query.recommendationType = type;
    }
    if (priority) {
      query.priority = priority;
    }
    if (storeId && storeId !== 'All' && storeId !== 'all') {
      query.$or = [{ storeId }, { storeId: '' }];
    }

    return await AiRecommendation.find(query)
      .sort({ generatedDate: -1, priority: 1 })
      .limit(limit)
      .lean();
  }

  /**
   * Mark a recommendation as applied or actioned
   */
  async applyRecommendation(id, userEmail = 'system') {
    const doc = await AiRecommendation.findByIdAndUpdate(
      id,
      {
        $set: {
          status: 'APPLIED',
          txt_Modified_By: userEmail,
          dte_Modified_Date: new Date(),
        },
      },
      { new: true }
    );

    if (!doc) {
      throw new Error(`Recommendation ${id} not found`);
    }

    return doc;
  }
}

module.exports = new IntelligenceService();
