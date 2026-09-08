const purchaseOrderService = require('../services/purchaseOrderService');
const { successResponse } = require('../utils/apiResponse');

class PurchaseOrderController {
  async getAllPurchaseOrders(req, res, next) {
    try {
      const pos = await purchaseOrderService.getAllPurchaseOrders(req.query);
      return successResponse(res, pos, 'Purchase orders retrieved');
    } catch (err) {
      next(err);
    }
  }

  async getPurchaseOrderById(req, res, next) {
    try {
      const po = await purchaseOrderService.getPurchaseOrderById(req.params.id);
      if (!po) return res.status(404).json({ success: false, message: 'Purchase order not found' });
      return successResponse(res, po);
    } catch (err) {
      next(err);
    }
  }

  async createPurchaseOrder(req, res, next) {
    try {
      const po = await purchaseOrderService.createPurchaseOrder(req.body, req.user);
      return successResponse(res, po, 'Purchase order created successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  async updateStatus(req, res, next) {
    try {
      const { status } = req.body;
      const po = await purchaseOrderService.updatePurchaseOrderStatus(req.params.id, status, req.user);
      return successResponse(res, po, `Purchase order status updated to ${status}`);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new PurchaseOrderController();
