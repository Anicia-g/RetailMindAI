const customerService = require('../services/customerService');
const { successResponse } = require('../utils/apiResponse');

class CustomerController {
  async getAllCustomers(req, res, next) {
    try {
      const customers = await customerService.getAllCustomers(req.query);
      return successResponse(res, customers, 'Customers fetched successfully');
    } catch (err) {
      next(err);
    }
  }

  async getCustomerById(req, res, next) {
    try {
      const customer = await customerService.getCustomerById(req.params.id);
      if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });
      return successResponse(res, customer);
    } catch (err) {
      next(err);
    }
  }

  async createCustomer(req, res, next) {
    try {
      const customer = await customerService.createCustomer(req.body, req.user);
      return successResponse(res, customer, 'Customer created successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  async updateCustomer(req, res, next) {
    try {
      const customer = await customerService.updateCustomer(req.params.id, req.body, req.user);
      return successResponse(res, customer, 'Customer updated successfully');
    } catch (err) {
      next(err);
    }
  }

  async deleteCustomer(req, res, next) {
    try {
      const result = await customerService.deleteCustomer(req.params.id, req.user);
      return successResponse(res, result);
    } catch (err) {
      next(err);
    }
  }

  // Customer Self-Service Endpoints
  async getProfile(req, res, next) {
    try {
      const customer = await customerService.getCustomerById(req.user.email) ||
                       await customerService.getCustomerById(req.user.id);
      return successResponse(res, customer || req.user, 'Customer profile retrieved');
    } catch (err) {
      next(err);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const customerId = req.user.id;
      const customer = await customerService.updateCustomer(customerId, req.body, req.user);
      return successResponse(res, customer, 'Profile updated successfully');
    } catch (err) {
      next(err);
    }
  }

  async getCustomerClusters(req, res, next) {
    try {
      const clusters = await customerService.getCustomerClusters();
      return successResponse(res, clusters, 'Customer clusters retrieved');
    } catch (err) {
      next(err);
    }
  }

  async getPreferences(req, res, next) {
    try {
      const customerId = req.query.customerId || req.user.email || req.user.id;
      const prefs = await customerService.getPreferences(customerId);
      return successResponse(res, prefs, 'Customer preferences retrieved');
    } catch (err) {
      next(err);
    }
  }

  async updatePreferences(req, res, next) {
    try {
      const customerId = req.body.customerId || req.user.email || req.user.id;
      const prefs = await customerService.updatePreferences(customerId, req.body.preferences || req.body, req.user);
      return successResponse(res, prefs, 'Customer preferences updated successfully');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new CustomerController();
