const reportService = require('../services/reportService');
const { successResponse } = require('../utils/apiResponse');

class ReportController {
  async getSalesReport(req, res, next) {
    try {
      const report = await reportService.getSalesReport(req.query);
      return successResponse(res, report, 'Sales report generated');
    } catch (err) {
      next(err);
    }
  }

  async getInventoryReport(req, res, next) {
    try {
      const report = await reportService.getInventoryReport(req.query);
      return successResponse(res, report, 'Inventory report generated');
    } catch (err) {
      next(err);
    }
  }

  async getCustomersReport(req, res, next) {
    try {
      const report = await reportService.getCustomersReport(req.query);
      return successResponse(res, report, 'Customer report generated');
    } catch (err) {
      next(err);
    }
  }

  async getSuppliersReport(req, res, next) {
    try {
      const report = await reportService.getSuppliersReport(req.query);
      return successResponse(res, report, 'Supplier report generated');
    } catch (err) {
      next(err);
    }
  }

  async getPurchasesReport(req, res, next) {
    try {
      const report = await reportService.getPurchasesReport(req.query);
      return successResponse(res, report, 'Purchases report generated');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ReportController();
