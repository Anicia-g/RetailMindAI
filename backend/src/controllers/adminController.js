const adminAnalyticsService = require('../services/adminAnalyticsService');
const { successResponse } = require('../utils/apiResponse');

class AdminController {
  async getDashboard(req, res, next) {
    try {
      const dashboardData = await adminAnalyticsService.getDashboardMetrics();
      return successResponse(res, dashboardData, 'Admin dashboard metrics retrieved');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AdminController();
