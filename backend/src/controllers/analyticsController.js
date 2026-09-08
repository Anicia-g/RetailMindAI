const salesAnalyticsService = require('../services/salesAnalyticsService');
const inventoryAnalyticsService = require('../services/inventoryAnalyticsService');
const customerAnalyticsService = require('../services/customerAnalyticsService');
const sellerAnalyticsService = require('../services/sellerAnalyticsService');
const dataQualityService = require('../services/dataQualityService');
const adminAnalyticsService = require('../services/adminAnalyticsService');
const { successResponse } = require('../utils/apiResponse');

class AnalyticsController {
  // 1. Revenue Analytics
  async getRevenueAnalytics(req, res, next) {
    try {
      const data = await salesAnalyticsService.getRevenueAnalytics(req.query);
      return successResponse(res, data, 'Revenue analytics retrieved');
    } catch (err) {
      next(err);
    }
  }

  // 2. Sales Analytics
  async getSalesAnalytics(req, res, next) {
    try {
      const data = await salesAnalyticsService.getSalesAnalytics(req.query);
      return successResponse(res, data, 'Sales analytics retrieved');
    } catch (err) {
      next(err);
    }
  }

  // 3. Category Analytics
  async getCategoryAnalytics(req, res, next) {
    try {
      const data = await salesAnalyticsService.getCategoryAnalytics(req.query);
      return successResponse(res, data, 'Category analytics retrieved');
    } catch (err) {
      next(err);
    }
  }

  // 4. Store Analytics
  async getStoreAnalytics(req, res, next) {
    try {
      const data = await salesAnalyticsService.getStoreAnalytics(req.query);
      return successResponse(res, data, 'Store performance analytics retrieved');
    } catch (err) {
      next(err);
    }
  }

  // 5. Payment Analytics
  async getPaymentAnalytics(req, res, next) {
    try {
      const data = await salesAnalyticsService.getPaymentAnalytics(req.query);
      return successResponse(res, data, 'Payment analytics retrieved');
    } catch (err) {
      next(err);
    }
  }

  // 6. Inventory Summary & Health
  async getInventoryAnalytics(req, res, next) {
    try {
      const storeId = req.query.storeId || null;
      const data = await inventoryAnalyticsService.getInventorySummary(storeId);
      return successResponse(res, data, 'Inventory analytics retrieved');
    } catch (err) {
      next(err);
    }
  }

  // 7. Seller Analytics / Performance
  async getSellerAnalytics(req, res, next) {
    try {
      const data = await sellerAnalyticsService.getSellerPerformance(req.query);
      return successResponse(res, data, 'Seller performance analytics retrieved');
    } catch (err) {
      next(err);
    }
  }

  // 8. Customer RFM Feature Dataset
  async getCustomerRFM(req, res, next) {
    try {
      const storeId = req.query.storeId || null;
      const data = await customerAnalyticsService.getCustomerRFM(storeId);
      return successResponse(res, data, 'Customer RFM feature dataset retrieved');
    } catch (err) {
      next(err);
    }
  }

  // 9. Top Customers Ranking
  async getTopCustomers(req, res, next) {
    try {
      const storeId = req.query.storeId || null;
      const limit = req.query.limit || 10;
      const sortBy = req.query.sortBy || 'monetary';
      const data = await customerAnalyticsService.getTopCustomers(storeId, limit, sortBy);
      return successResponse(res, data, 'Top customers ranking retrieved');
    } catch (err) {
      next(err);
    }
  }

  // 10. Product Chronological Demand History
  async getDemandHistory(req, res, next) {
    try {
      const { productId } = req.params;
      const storeId = req.query.storeId || null;
      const days = req.query.days || 30;
      const data = await salesAnalyticsService.getDemandHistory(productId, storeId, days);
      return successResponse(res, data, 'Product demand history retrieved');
    } catch (err) {
      next(err);
    }
  }

  // 11. Inventory Risk ML Features
  async getInventoryRiskFeatures(req, res, next) {
    try {
      const storeId = req.query.storeId || null;
      const data = await inventoryAnalyticsService.getInventoryRiskFeatures(storeId);
      return successResponse(res, data, 'Inventory risk feature matrix retrieved');
    } catch (err) {
      next(err);
    }
  }

  // 12. Smart Discount ML Features (ID3/C4.5)
  async getDiscountFeatures(req, res, next) {
    try {
      const storeId = req.query.storeId || null;
      const data = await inventoryAnalyticsService.getDiscountFeatures(storeId);
      return successResponse(res, data, 'Discount ML feature matrix retrieved');
    } catch (err) {
      next(err);
    }
  }

  // 13. Data Quality & Reconciliation Check
  async getDataQualityAudit(req, res, next) {
    try {
      const data = await dataQualityService.runAudit();
      return successResponse(res, data, 'Data quality audit completed');
    } catch (err) {
      next(err);
    }
  }

  // Legacy alias
  async getCustomerAnalytics(req, res, next) {
    try {
      const data = await customerAnalyticsService.getCustomerRFM();
      return successResponse(res, data, 'Customer analytics retrieved');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AnalyticsController();
