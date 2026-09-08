const storeService = require('../services/storeService');
const { successResponse } = require('../utils/apiResponse');

class StoreController {
  async getAllStores(req, res, next) {
    try {
      const stores = await storeService.getAllStores();
      return successResponse(res, stores, 'Stores fetched successfully');
    } catch (err) {
      next(err);
    }
  }

  async getStoreById(req, res, next) {
    try {
      const store = await storeService.getStoreById(req.params.id);
      if (!store) return res.status(404).json({ success: false, message: 'Store not found' });
      return successResponse(res, store);
    } catch (err) {
      next(err);
    }
  }

  async createStore(req, res, next) {
    try {
      const store = await storeService.createStore(req.body, req.user);
      return successResponse(res, store, 'Store created successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  async updateStore(req, res, next) {
    try {
      const store = await storeService.updateStore(req.params.id, req.body, req.user);
      return successResponse(res, store, 'Store updated successfully');
    } catch (err) {
      next(err);
    }
  }

  async deleteStore(req, res, next) {
    try {
      const result = await storeService.deleteStore(req.params.id, req.user);
      return successResponse(res, result);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new StoreController();
