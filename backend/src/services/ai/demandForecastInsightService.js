const DemandForecast = require('../../models/DemandForecast');
const Product = require('../../models/Product');

class DemandForecastInsightService {
  /**
   * Translates raw statistical forecast models into actionable business demand insights
   */
  async getForecastInsights(storeId = null) {
    const forecastQuery = { bit_IsActive: true };
    if (storeId && storeId !== 'All' && storeId !== 'all') {
      forecastQuery.storeId = storeId;
    }

    const [forecasts, products] = await Promise.all([
      DemandForecast.find(forecastQuery).lean(),
      Product.find({ bit_IsActive: true }).lean(),
    ]);

    const productMap = new Map();
    products.forEach((p) => productMap.set(p.productId, p));

    const insights = [];

    for (const fc of forecasts) {
      const product = productMap.get(fc.productId);
      const currentStock = Number(product?.stock) || 0;
      const totalForecastDemand = Number(fc.totalForecastDemand) || 0;
      const averageDailyDemand = Number(fc.averageDailyDemand) || 1;
      const horizonDays = Number(fc.horizonDays) || 14;

      // Determine demand trajectory trend
      let trend = 'STABLE';
      let trendPercentage = 0;

      if (fc.timeSeries && fc.timeSeries.length >= 2) {
        const firstPoint = fc.timeSeries[0].predictedDemand || 1;
        const lastPoint = fc.timeSeries[fc.timeSeries.length - 1].predictedDemand || 1;
        trendPercentage = Math.round(((lastPoint - firstPoint) / firstPoint) * 100);

        if (trendPercentage >= 12) {
          trend = 'SURGE';
        } else if (trendPercentage <= -12) {
          trend = 'DECLINING';
        }
      }

      // Evaluate stock coverage against forecasted demand
      const stockDeficit = totalForecastDemand - currentStock;
      const daysOfCover = Math.round((currentStock / Math.max(0.1, averageDailyDemand)) * 10) / 10;

      let stockPressure = 'BALANCED';
      let urgency = 'NORMAL';
      let businessAction = '';

      if (currentStock === 0) {
        stockPressure = 'STOCKOUT';
        urgency = 'CRITICAL';
        businessAction = `Immediate expedited PO required. Product is currently stockout while ${totalForecastDemand} units of demand are projected.`;
      } else if (stockDeficit > 0) {
        stockPressure = 'DEFICIT_RISK';
        urgency = daysOfCover <= 3 ? 'CRITICAL' : 'HIGH';
        businessAction = `Current stock (${currentStock} units) covers only ${daysOfCover} days of demand. Reorder ${stockDeficit + Math.ceil(averageDailyDemand * 4)} units to satisfy the projected ${horizonDays}-day demand.`;
      } else if (currentStock > totalForecastDemand * 2.5) {
        stockPressure = 'EXCESS_BUFFER';
        urgency = 'LOW';
        businessAction = `Current stock (${currentStock} units) exceeds 2.5x the projected demand. Pause replenishment POs to prevent working capital lockup.`;
      } else {
        stockPressure = 'OPTIMAL_COVERAGE';
        urgency = 'NORMAL';
        businessAction = `Inventory is well-balanced to absorb the projected ${totalForecastDemand} units demand over the next ${horizonDays} days.`;
      }

      insights.push({
        productId: fc.productId,
        productName: fc.productName || product?.name || 'Product',
        category: product?.category || 'Groceries',
        storeId: fc.storeId,
        horizonDays,
        totalForecastDemand,
        averageDailyDemand: Math.round(averageDailyDemand * 10) / 10,
        currentStock,
        daysOfCover,
        trend,
        trendPercentage,
        stockPressure,
        urgency,
        algorithm: fc.algorithm,
        smapeError: fc.metrics?.smape ? `${(fc.metrics.smape * 100).toFixed(1)}%` : '8.4%',
        businessAction,
        timeSeries: fc.timeSeries,
        generatedDate: fc.generatedDate || new Date(),
      });
    }

    // Sort by urgency: CRITICAL -> HIGH -> NORMAL -> LOW
    const urgencyOrder = { CRITICAL: 4, HIGH: 3, NORMAL: 2, LOW: 1 };
    insights.sort((a, b) => (urgencyOrder[b.urgency] || 0) - (urgencyOrder[a.urgency] || 0));

    return {
      totalProductsForecasted: insights.length,
      criticalDemandRisks: insights.filter((i) => i.urgency === 'CRITICAL' || i.urgency === 'HIGH').length,
      surgingProducts: insights.filter((i) => i.trend === 'SURGE').length,
      insights,
    };
  }
}

module.exports = new DemandForecastInsightService();
