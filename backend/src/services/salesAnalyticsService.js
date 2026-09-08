const Order = require('../models/Order');
const Product = require('../models/Product');
const Store = require('../models/Store');
const Payment = require('../models/Payment');
const { parseDateRange, calculateGrowthPercentage, formatGrowthString } = require('../utils/dateUtils');

class SalesAnalyticsService {
  /**
   * Match stage helper for completed sales within a date range and optional store
   */
  getCompletedSalesMatch(startDate, endDate, storeId = null) {
    const match = {
      bit_IsActive: true,
      status: { $in: ['Completed', 'Delivered'] },
    };

    if (startDate && endDate) {
      match.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    if (storeId && storeId !== 'All' && storeId !== 'all') {
      match.$or = [{ storeId }, { store: new RegExp(storeId, 'i') }];
    }

    return match;
  }

  /**
   * GET /api/analytics/revenue
   * High-accuracy period comparison and revenue breakdown
   */
  async getRevenueAnalytics(query = {}) {
    const { startDate, endDate, prevStartDate, prevEndDate, diffDays } = parseDateRange(
      query.range,
      query.startDate,
      query.endDate
    );
    const storeId = query.storeId || null;

    // 1. Current period revenue
    const currentMatch = this.getCompletedSalesMatch(startDate, endDate, storeId);
    const [currentMetrics] = await Order.aggregate([
      { $match: currentMatch },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          totalOrders: { $sum: 1 },
          subtotal: { $sum: '$subtotal' },
          totalDiscount: { $sum: '$discount' },
          totalTax: { $sum: '$tax' },
        },
      },
    ]);

    // 2. Previous period revenue
    const prevMatch = this.getCompletedSalesMatch(prevStartDate, prevEndDate, storeId);
    const [prevMetrics] = await Order.aggregate([
      { $match: prevMatch },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          totalOrders: { $sum: 1 },
        },
      },
    ]);

    const totalRevenue = currentMetrics?.totalRevenue || 0;
    const totalOrders = currentMetrics?.totalOrders || 0;
    const previousPeriodRevenue = prevMetrics?.totalRevenue || 0;
    const previousPeriodOrders = prevMetrics?.totalOrders || 0;

    const growthPercentage = calculateGrowthPercentage(totalRevenue, previousPeriodRevenue);
    const orderGrowthPercentage = calculateGrowthPercentage(totalOrders, previousPeriodOrders);
    const averageOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    // 3. Daily revenue breakdown
    const dailyRevenue = await Order.aggregate([
      { $match: currentMatch },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          date: '$_id',
          revenue: '$revenue',
          orders: '$orders',
        },
      },
    ]);

    // 4. Monthly revenue breakdown
    const monthlyRevenue = await Order.aggregate([
      { $match: { bit_IsActive: true, status: { $in: ['Completed', 'Delivered'] } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          month: '$_id',
          revenue: '$revenue',
          orders: '$orders',
        },
      },
    ]);

    return {
      period: {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        durationDays: diffDays,
        previousStartDate: prevStartDate.toISOString().split('T')[0],
        previousEndDate: prevEndDate.toISOString().split('T')[0],
      },
      totalRevenue,
      previousPeriodRevenue,
      growthPercentage,
      growthFormatted: formatGrowthString(growthPercentage),
      totalOrders,
      previousPeriodOrders,
      orderGrowthPercentage,
      orderGrowthFormatted: formatGrowthString(orderGrowthPercentage),
      averageOrderValue,
      dailyRevenue,
      monthlyRevenue,
    };
  }

  /**
   * GET /api/analytics/sales
   * Consolidated sales volume, trends, top products, categories, payment mix
   */
  async getSalesAnalytics(query = {}) {
    const { startDate, endDate } = parseDateRange(query.range, query.startDate, query.endDate);
    const storeId = query.storeId || null;
    const match = this.getCompletedSalesMatch(startDate, endDate, storeId);

    // 1. Core KPIs & Units Sold
    const [salesKpi] = await Order.aggregate([
      { $match: match },
      { $unwind: { path: '$items', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$_id',
          totalAmount: { $first: '$totalAmount' },
          unitsInOrder: { $sum: '$items.qty' },
        },
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$totalAmount' },
          totalOrders: { $sum: 1 },
          unitsSold: { $sum: '$unitsInOrder' },
        },
      },
    ]);

    const totalSales = salesKpi?.totalSales || 0;
    const totalOrders = salesKpi?.totalOrders || 0;
    const unitsSold = salesKpi?.unitsSold || 0;
    const averageOrderValue = totalOrders > 0 ? Math.round(totalSales / totalOrders) : 0;

    // 2. Sales Trend (Daily)
    const salesTrend = await Order.aggregate([
      { $match: match },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          date: '$_id',
          revenue: '$revenue',
          orders: '$orders',
        },
      },
    ]);

    // 3. Top Products by sales volume & revenue
    const topProducts = await Order.aggregate([
      { $match: match },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          name: { $first: '$items.name' },
          sku: { $first: '$items.sku' },
          image: { $first: '$items.image' },
          unitsSold: { $sum: '$items.qty' },
          revenue: { $sum: '$items.total' },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 10 },
      {
        $project: {
          _id: 0,
          productId: '$_id',
          name: 1,
          sku: 1,
          image: 1,
          unitsSold: 1,
          revenue: 1,
          orderCount: 1,
        },
      },
    ]);

    // 4. Category Performance
    const topCategories = await this.getCategoryAnalytics(query);

    // 5. Store Performance
    const storePerformance = await this.getStoreAnalytics(query);

    // 6. Payment Distribution
    const paymentDistribution = await this.getPaymentAnalytics(query);

    return {
      kpis: {
        totalSales,
        totalOrders,
        unitsSold,
        averageOrderValue,
      },
      totalSales,
      totalOrders,
      unitsSold,
      averageOrderValue,
      salesTrend,
      topProducts,
      topCategories,
      storePerformance,
      paymentDistribution,
    };
  }

  /**
   * GET /api/analytics/categories
   */
  async getCategoryAnalytics(query = {}) {
    const { startDate, endDate } = parseDateRange(query.range, query.startDate, query.endDate);
    const storeId = query.storeId || null;
    const match = this.getCompletedSalesMatch(startDate, endDate, storeId);

    // Aggregate category revenue from orders and product categories
    const categoriesAgg = await Order.aggregate([
      { $match: match },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.productId',
          foreignField: 'productId',
          as: 'productDoc',
        },
      },
      {
        $addFields: {
          category: {
            $ifNull: [{ $arrayElemAt: ['$productDoc.category', 0] }, 'General Grocery'],
          },
        },
      },
      {
        $group: {
          _id: '$category',
          revenue: { $sum: '$items.total' },
          unitsSold: { $sum: '$items.qty' },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { revenue: -1 } },
    ]);

    const totalCategoryRevenue = categoriesAgg.reduce((acc, c) => acc + c.revenue, 0) || 1;

    return categoriesAgg.map((c) => ({
      category: c._id,
      revenue: c.revenue,
      unitsSold: c.unitsSold,
      orderCount: c.orderCount,
      percentageOfSales: Number(((c.revenue / totalCategoryRevenue) * 100).toFixed(1)),
      share: Number(((c.revenue / totalCategoryRevenue) * 100).toFixed(1)),
    }));
  }

  /**
   * GET /api/analytics/stores
   */
  async getStoreAnalytics(query = {}) {
    const { startDate, endDate } = parseDateRange(query.range, query.startDate, query.endDate);
    const match = this.getCompletedSalesMatch(startDate, endDate);

    const storeSalesAgg = await Order.aggregate([
      { $match: match },
      { $unwind: { path: '$items', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: {
            storeId: '$storeId',
            store: '$store',
          },
          revenue: { $sum: '$totalAmount' },
          orderCount: { $addToSet: '$_id' },
          unitsSold: { $sum: '$items.qty' },
        },
      },
      {
        $project: {
          _id: 0,
          storeId: '$_id.storeId',
          store: '$_id.store',
          revenue: '$revenue',
          orders: { $size: '$orderCount' },
          unitsSold: '$unitsSold',
          averageOrderValue: {
            $cond: [
              { $gt: [{ $size: '$orderCount' }, 0] },
              { $round: [{ $divide: ['$revenue', { $size: '$orderCount' }] }, 0] },
              0,
            ],
          },
        },
      },
      { $sort: { revenue: -1 } },
    ]);

    // Lookup physical stores to supplement missing stores or inventory values
    const allStores = await Store.find({ bit_IsActive: true });
    const storeMap = new Map();
    allStores.forEach((s) => {
      storeMap.set(s.storeId || s.code, s);
    });

    return storeSalesAgg.map((item) => {
      const storeObj = storeMap.get(item.storeId) || {};
      return {
        ...item,
        city: storeObj.city || 'Bangalore',
        health: storeObj.inventoryHealth || 'Healthy',
      };
    });
  }

  /**
   * GET /api/analytics/payments
   */
  async getPaymentAnalytics(query = {}) {
    const { startDate, endDate } = parseDateRange(query.range, query.startDate, query.endDate);
    const storeId = query.storeId || null;
    const match = this.getCompletedSalesMatch(startDate, endDate, storeId);

    const paymentAgg = await Order.aggregate([
      { $match: match },
      {
        $group: {
          _id: { $ifNull: ['$paymentMethod', 'UPI'] },
          transactionCount: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' },
        },
      },
      { $sort: { totalAmount: -1 } },
    ]);

    const totalVolume = paymentAgg.reduce((acc, p) => acc + p.totalAmount, 0) || 1;

    return paymentAgg.map((p) => ({
      method: p._id,
      transactionCount: p.transactionCount,
      totalAmount: p.totalAmount,
      amount: p.totalAmount,
      percentage: Number(((p.totalAmount / totalVolume) * 100).toFixed(1)),
    }));
  }

  /**
   * GET /api/analytics/products/:productId/demand-history
   * Clean chronological daily demand series for ARIMA / Holt-Winters
   */
  async getDemandHistory(productId, storeId = null, days = 30) {
    const { startDate, endDate } = parseDateRange(`${days}d`);
    const match = {
      bit_IsActive: true,
      status: { $in: ['Completed', 'Delivered'] },
      'items.productId': productId,
      createdAt: { $gte: startDate, $lte: endDate },
    };

    if (storeId && storeId !== 'All') {
      match.$or = [{ storeId }, { store: new RegExp(storeId, 'i') }];
    }

    const demandAgg = await Order.aggregate([
      { $match: match },
      { $unwind: '$items' },
      { $match: { 'items.productId': productId } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          unitsSold: { $sum: '$items.qty' },
          revenue: { $sum: '$items.total' },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          date: '$_id',
          unitsSold: '$unitsSold',
          revenue: '$revenue',
          orderCount: '$orderCount',
        },
      },
    ]);

    // Fill in continuous missing dates with 0 unitsSold
    const historyMap = new Map();
    demandAgg.forEach((d) => historyMap.set(d.date, d.unitsSold));

    const completeSeries = [];
    const curr = new Date(startDate);
    while (curr <= endDate) {
      const dateStr = curr.toISOString().split('T')[0];
      completeSeries.push({
        productId,
        date: dateStr,
        unitsSold: historyMap.get(dateStr) || 0,
      });
      curr.setDate(curr.getDate() + 1);
    }

    return {
      productId,
      storeId: storeId || 'All',
      daysChecked: days,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      totalUnitsSold: demandAgg.reduce((acc, d) => acc + d.unitsSold, 0),
      dailyDemandSeries: completeSeries,
    };
  }
}

module.exports = new SalesAnalyticsService();
