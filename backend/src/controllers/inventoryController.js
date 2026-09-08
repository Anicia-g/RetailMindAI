const inventoryService = require('../services/inventoryService');
const { successResponse } = require('../utils/apiResponse');

class InventoryController {
  async getAllInventory(req, res, next) {
    try {
      const items = await inventoryService.getAllInventory(req.query);
      return successResponse(res, items, 'Inventory records retrieved');
    } catch (err) {
      next(err);
    }
  }

  async getInventoryById(req, res, next) {
    try {
      const item = await inventoryService.getInventoryById(req.params.id);
      if (!item) return res.status(404).json({ success: false, message: 'Inventory item not found' });
      return successResponse(res, item);
    } catch (err) {
      next(err);
    }
  }

  async adjustStock(req, res, next) {
    try {
      const result = await inventoryService.adjustStock(req.body, req.user);
      return successResponse(res, result, 'Stock adjusted and transaction recorded');
    } catch (err) {
      next(err);
    }
  }

  async getStockTransactions(req, res, next) {
    try {
      const transactions = await inventoryService.getStockTransactions(req.query);
      return successResponse(res, transactions, 'Stock transactions retrieved');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new InventoryController();
