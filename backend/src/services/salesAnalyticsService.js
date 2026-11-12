const { query } = require('../config/db');
const { parseDateRange, calculateGrowthPercentage, formatGrowthString } = require('../utils/dateUtils');
const productRepository = require('../repositories/productRepository');

class SalesAnalyticsService {
  /**
   * Helper to build SQL WHERE conditions for completed sales
   */
  buildCompletedSalesWhere(startDate, endDate, storeId = null) {
    let where = `WHERE o.bit_IsActive = 1 AND UPPER(o.txt_Order_Status) IN ('COMPLETED', 'DELIVERED')`;
    const params = [];

    if (startDate && endDate) {
      where += ` AND o.dte_Order_Date >= ? AND o.dte_Order_Date <= ?`;
      params.push(startDate, endDate);
    }

    if (storeId && storeId !== 'All' && storeId !== 'all') {
      const storeNum = parseInt(String(storeId).replace(/\D/g, ''), 10);
      if (!isNaN(storeNum)) {
        where += ` AND o.int_Store_Id = ?`;
        params.push(storeNum);
      }
    }

    return { where, params };
  }

  /**
   * GET /api/analytics/revenue
   * High-accuracy period comparison and revenue breakdown
   */
  async getRevenueAnalytics(queryParams = {}) {
    const { startDate, endDate, prevStartDate, prevEndDate, diffDays } = parseDateRange(
      queryParams.range,
      queryParams.startDate,
      queryParams.endDate
    );
    const storeId = queryParams.storeId || null;

    // 1. Current period metrics
    const current = this.buildCompletedSalesWhere(startDate, endDate, storeId);
    const currentSql = `
      SELECT 
        COALESCE(SUM(o.dec_Total_Amount), 0) AS totalRevenue,
        COUNT(o.int_Order_Id) AS totalOrders,
        COALESCE(SUM(o.dec_Subtotal_Amount), 0) AS subtotal,
        COALESCE(SUM(o.dec_Discount_Amount), 0) AS totalDiscount,
        COALESCE(SUM(o.dec_Tax_Amount), 0) AS totalTax
      FROM tbl_Order o
      ${current.where}
    `;
    const [currentMetrics] = await query(currentSql, current.params);

    // 2. Previous period metrics
    const prev = this.buildCompletedSalesWhere(prevStartDate, prevEndDate, storeId);
    const prevSql = `
      SELECT 
        COALESCE(SUM(o.dec_Total_Amount), 0) AS totalRevenue,
        COUNT(o.int_Order_Id) AS totalOrders
      FROM tbl_Order o
      ${prev.where}
    `;
    const [prevMetrics] = await query(prevSql, prev.params);

    const totalRevenue = Number(currentMetrics?.totalRevenue || 0);
    const totalOrders = Number(currentMetrics?.totalOrders || 0);
    const previousPeriodRevenue = Number(prevMetrics?.totalRevenue || 0);
    const previousPeriodOrders = Number(prevMetrics?.totalOrders || 0);

    const growthPercentage = calculateGrowthPercentage(totalRevenue, previousPeriodRevenue);
    const orderGrowthPercentage = calculateGrowthPercentage(totalOrders, previousPeriodOrders);
    const averageOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    // 3. Daily revenue breakdown
    const dailySql = `
      SELECT 
        DATE_FORMAT(o.dte_Order_Date, '%Y-%m-%d') AS date,
        COALESCE(SUM(o.dec_Total_Amount), 0) AS revenue,
        COUNT(o.int_Order_Id) AS orders
      FROM tbl_Order o
      ${current.where}
      GROUP BY DATE_FORMAT(o.dte_Order_Date, '%Y-%m-%d')
      ORDER BY date ASC
    `;
    const dailyRevenue = await query(dailySql, current.params);

    // 4. Monthly revenue breakdown
    const monthlySql = `
      SELECT 
        DATE_FORMAT(o.dte_Order_Date, '%Y-%m') AS month,
        COALESCE(SUM(o.dec_Total_Amount), 0) AS revenue,
        COUNT(o.int_Order_Id) AS orders
      FROM tbl_Order o
      WHERE o.bit_IsActive = 1 AND UPPER(o.txt_Order_Status) IN ('COMPLETED', 'DELIVERED')
      GROUP BY DATE_FORMAT(o.dte_Order_Date, '%Y-%m')
      ORDER BY month ASC
    `;
    const monthlyRevenue = await query(monthlySql, []);

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
      dailyRevenue: dailyRevenue.map((d) => ({ date: d.date, revenue: Number(d.revenue), orders: Number(d.orders) })),
      monthlyRevenue: monthlyRevenue.map((m) => ({ month: m.month, revenue: Number(m.revenue), orders: Number(m.orders) })),
    };
  }

  /**
   * GET /api/analytics/sales
   * Consolidated sales volume, trends, top products
   */
  async getSalesAnalytics(queryParams = {}) {
    const { startDate, endDate } = parseDateRange(queryParams.range, queryParams.startDate, queryParams.endDate);
    const storeId = queryParams.storeId || null;
    const { where, params } = this.buildCompletedSalesWhere(startDate, endDate, storeId);

    // Sales KPI
    const kpiSql = `
      SELECT 
        COALESCE(SUM(o.dec_Total_Amount), 0) AS totalSales,
        COUNT(DISTINCT o.int_Order_Id) AS totalOrders,
        COALESCE(SUM(oi.int_Quantity), 0) AS unitsSold
      FROM tbl_Order o
      LEFT JOIN tbl_Order_Item oi ON o.int_Order_Id = oi.int_Order_Id AND oi.bit_IsActive = 1
      ${where}
    `;
    const [salesKpi] = await query(kpiSql, params);

    const totalSales = Number(salesKpi?.totalSales || 0);
    const totalOrders = Number(salesKpi?.totalOrders || 0);
    const unitsSold = Number(salesKpi?.unitsSold || 0);
    const averageOrderValue = totalOrders > 0 ? Math.round(totalSales / totalOrders) : 0;

    // Sales Trend
    const trendSql = `
      SELECT 
        DATE_FORMAT(o.dte_Order_Date, '%Y-%m-%d') AS date,
        COALESCE(SUM(o.dec_Total_Amount), 0) AS revenue,
        COUNT(DISTINCT o.int_Order_Id) AS orders
      FROM tbl_Order o
      ${where}
      GROUP BY DATE_FORMAT(o.dte_Order_Date, '%Y-%m-%d')
      ORDER BY date ASC
    `;
    const trendRows = await query(trendSql, params);
    const salesTrend = trendRows.map((r) => ({
      date: r.date,
      revenue: Number(r.revenue),
      orders: Number(r.orders),
    }));

    // Top Products
    const topProdSql = `
      SELECT 
        p.int_Product_Id AS productId,
        p.txt_Product_Name AS name,
        p.txt_SKU AS sku,
        p.txt_Product_Image_URL AS image,
        COALESCE(SUM(oi.int_Quantity), 0) AS unitsSold,
        COALESCE(SUM(oi.dec_Line_Total), 0) AS revenue,
        COUNT(DISTINCT o.int_Order_Id) AS orderCount
      FROM tbl_Order_Item oi
      JOIN tbl_Order o ON oi.int_Order_Id = o.int_Order_Id
      JOIN tbl_Product p ON oi.int_Product_Id = p.int_Product_Id
      ${where}
      GROUP BY p.int_Product_Id, p.txt_Product_Name, p.txt_SKU, p.txt_Product_Image_URL
      ORDER BY revenue DESC
      LIMIT 10
    `;
    const topProductsRows = await query(topProdSql, params);
    const topProducts = topProductsRows.map((p) => ({
      productId: `prod-${String(p.productId).padStart(3, '0')}`,
      name: p.name,
      sku: p.sku,
      image: p.image || '',
      unitsSold: Number(p.unitsSold),
      revenue: Number(p.revenue),
      orderCount: Number(p.orderCount),
    }));

    return {
      kpis: {
        totalSales,
        totalOrders,
        unitsSold,
        averageOrderValue,
      },
      salesTrend,
      topProducts,
    };
  }

  /**
   * GET /api/analytics/categories
   */
  async getCategoryAnalytics(queryParams = {}) {
    const { startDate, endDate } = parseDateRange(queryParams.range, queryParams.startDate, queryParams.endDate);
    const storeId = queryParams.storeId || null;
    const { where, params } = this.buildCompletedSalesWhere(startDate, endDate, storeId);

    const sql = `
      SELECT 
        c.txt_Category_Name AS category,
        COALESCE(SUM(oi.dec_Line_Total), 0) AS revenue,
        COALESCE(SUM(oi.int_Quantity), 0) AS unitsSold,
        COUNT(DISTINCT o.int_Order_Id) AS orderCount
      FROM tbl_Order_Item oi
      JOIN tbl_Order o ON oi.int_Order_Id = o.int_Order_Id
      JOIN tbl_Product p ON oi.int_Product_Id = p.int_Product_Id
      JOIN tbl_Category c ON p.int_Category_Id = c.int_Category_Id
      ${where}
      GROUP BY c.txt_Category_Name
      ORDER BY revenue DESC
    `;
    const rows = await query(sql, params);
    const totalRev = rows.reduce((acc, r) => acc + Number(r.revenue), 0);

    return rows.map((r) => ({
      category: r.category,
      revenue: Number(r.revenue),
      unitsSold: Number(r.unitsSold),
      orderCount: Number(r.orderCount),
      percentageOfTotal: totalRev > 0 ? Number(((Number(r.revenue) / totalRev) * 100).toFixed(1)) : 0,
    }));
  }

  /**
   * GET /api/analytics/stores
   */
  async getStoreAnalytics(queryParams = {}) {
    const { startDate, endDate } = parseDateRange(queryParams.range, queryParams.startDate, queryParams.endDate);
    const { where, params } = this.buildCompletedSalesWhere(startDate, endDate);

    const sql = `
      SELECT 
        s.int_Store_Id AS storeId,
        s.txt_Store_Name AS store,
        COALESCE(SUM(o.dec_Total_Amount), 0) AS revenue,
        COUNT(DISTINCT o.int_Order_Id) AS orders,
        COALESCE(SUM(oi.int_Quantity), 0) AS unitsSold,
        CASE WHEN COUNT(DISTINCT o.int_Order_Id) > 0 THEN ROUND(SUM(o.dec_Total_Amount)/COUNT(DISTINCT o.int_Order_Id), 0) ELSE 0 END AS averageOrderValue
      FROM tbl_Store s
      LEFT JOIN tbl_Order o ON s.int_Store_Id = o.int_Store_Id AND o.bit_IsActive = 1 AND UPPER(o.txt_Order_Status) IN ('COMPLETED', 'DELIVERED')
      LEFT JOIN tbl_Order_Item oi ON o.int_Order_Id = oi.int_Order_Id AND oi.bit_IsActive = 1
      GROUP BY s.int_Store_Id, s.txt_Store_Name
      ORDER BY revenue DESC
    `;
    const rows = await query(sql, []);
    return rows.map((r) => ({
      storeId: `store-${String(r.storeId).padStart(2, '0')}`,
      store: r.store,
      revenue: Number(r.revenue),
      orders: Number(r.orders),
      unitsSold: Number(r.unitsSold),
      averageOrderValue: Number(r.averageOrderValue),
    }));
  }

  /**
   * GET /api/analytics/payments
   */
  async getPaymentAnalytics(queryParams = {}) {
    const { startDate, endDate } = parseDateRange(queryParams.range, queryParams.startDate, queryParams.endDate);
    const storeId = queryParams.storeId || null;
    const { where, params } = this.buildCompletedSalesWhere(startDate, endDate, storeId);

    const sql = `
      SELECT 
        COALESCE(pm.txt_Payment_Method_Name, 'UPI') AS method,
        COUNT(o.int_Order_Id) AS transactionCount,
        COALESCE(SUM(o.dec_Total_Amount), 0) AS totalAmount
      FROM tbl_Order o
      LEFT JOIN tbl_Payment_Method pm ON o.int_Payment_Method_Id = pm.int_Payment_Method_Id
      ${where}
      GROUP BY pm.txt_Payment_Method_Name
      ORDER BY totalAmount DESC
    `;
    const rows = await query(sql, params);
    const grandTotal = rows.reduce((acc, r) => acc + Number(r.totalAmount), 0);

    return rows.map((r) => ({
      method: r.method,
      transactionCount: Number(r.transactionCount),
      totalAmount: Number(r.totalAmount),
      sharePercentage: grandTotal > 0 ? Number(((Number(r.totalAmount) / grandTotal) * 100).toFixed(1)) : 0,
    }));
  }

  /**
   * GET /api/analytics/products/:productId/demand-history
   */
  async getDemandHistory(productId, days = 90) {
    const numericProdMatch = String(productId).match(/\d+/);
    const prodIdNum = numericProdMatch ? parseInt(numericProdMatch[0], 10) : 1;

    const sql = `
      SELECT 
        DATE_FORMAT(o.dte_Order_Date, '%Y-%m-%d') AS date,
        COALESCE(SUM(oi.int_Quantity), 0) AS unitsSold,
        COALESCE(SUM(oi.dec_Line_Total), 0) AS revenue,
        COUNT(DISTINCT o.int_Order_Id) AS orderCount
      FROM tbl_Order_Item oi
      JOIN tbl_Order o ON oi.int_Order_Id = o.int_Order_Id
      WHERE oi.int_Product_Id = ? AND o.bit_IsActive = 1 AND UPPER(o.txt_Order_Status) IN ('COMPLETED', 'DELIVERED')
      GROUP BY DATE_FORMAT(o.dte_Order_Date, '%Y-%m-%d')
      ORDER BY date ASC
    `;
    const rows = await query(sql, [prodIdNum]);

    const series = rows.map((r) => ({
      date: r.date,
      unitsSold: Number(r.unitsSold),
      revenue: Number(r.revenue),
      orderCount: Number(r.orderCount),
      demand: Number(r.unitsSold),
    }));

    return {
      productId,
      daysRequested: Number(days),
      totalObservations: rows.length,
      history: series,
      dailyDemandSeries: series,
    };
  }

  /**
   * GET /api/analytics/products/discount-features
   */
  async getDiscountFeatures(storeId = null) {
    const products = await productRepository.findAllProducts({ storeId });
    return products.map((p) => {
      const price = Number(p.price || 0);
      const costPrice = Number(p.costPrice || (price * 0.7));
      const profitMarginPct = price > 0 ? Number((((price - costPrice) / price) * 100).toFixed(1)) : 25;
      const daysToExpiry = Number(p.expiryDays || p.shelfLifeDays || 30);
      const salesVelocity = Number(p.dailyVelocity || 5);

      return {
        productId: p.productId,
        productName: p.name,
        category: p.category,
        currentPrice: price,
        price,
        costPrice,
        currentDiscount: Number(p.discount || 0),
        currentStock: Number(p.stock || 0),
        stock: Number(p.stock || 0),
        shelfLifeDays: Number(p.shelfLifeDays || 30),
        daysToExpiry,
        isPerishable: Boolean(p.isPerishable),
        dailySalesVelocity: salesVelocity,
        salesVelocity,
        dailyVelocity: salesVelocity,
        expectedStockoutDays: Number(p.expectedStockoutDays || 10),
        profitMarginPct,
      };
    });
  }
}

module.exports = new SalesAnalyticsService();
