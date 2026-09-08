const sellerService = require('../services/sellerService');
const customerService = require('../services/customerService');
const { successResponse } = require('../utils/apiResponse');

class SellerController {
  // ADMIN Seller Management
  async getAllSellers(req, res, next) {
    try {
      const sellers = await sellerService.getAllSellers();
      return successResponse(res, sellers, 'Sellers retrieved successfully');
    } catch (err) {
      next(err);
    }
  }

  async getSellerById(req, res, next) {
    try {
      const seller = await sellerService.getSellerById(req.params.id);
      if (!seller) return res.status(404).json({ success: false, message: 'Seller not found' });
      return successResponse(res, seller);
    } catch (err) {
      next(err);
    }
  }

  async createSeller(req, res, next) {
    try {
      const seller = await sellerService.createSeller(req.body, req.user);
      return successResponse(res, seller, 'Seller created successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  async updateSeller(req, res, next) {
    try {
      const seller = await sellerService.updateSeller(req.params.id, req.body, req.user);
      return successResponse(res, seller, 'Seller updated successfully');
    } catch (err) {
      next(err);
    }
  }

  // SELLER Specific Endpoints
  async getProfile(req, res, next) {
    try {
      const profile = await sellerService.getSellerById(req.user.id);
      return successResponse(res, profile, 'Seller profile fetched');
    } catch (err) {
      next(err);
    }
  }

  async getDashboard(req, res, next) {
    try {
      const dashboard = await sellerService.getSellerDashboard(req.user);
      return successResponse(res, dashboard, 'Seller dashboard data retrieved');
    } catch (err) {
      next(err);
    }
  }

  async getBestSellers(req, res, next) {
    try {
      const bestSellers = await sellerService.getSellerBestSellers(req.user);
      return successResponse(res, bestSellers, 'Best-selling products retrieved');
    } catch (err) {
      next(err);
    }
  }

  async getBestCustomer(req, res, next) {
    try {
      const storeId = req.user?.storeId || 'store-01';
      const bestCustomer = await customerService.getBestCustomerAnalytics(storeId);
      return successResponse(res, bestCustomer, 'Best customer calculated from transaction history');
    } catch (err) {
      next(err);
    }
  }

  async getAnalytics(req, res, next) {
    try {
      const dashboard = await sellerService.getSellerDashboard(req.user);
      return successResponse(res, dashboard, 'Seller analytics fetched');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new SellerController();
