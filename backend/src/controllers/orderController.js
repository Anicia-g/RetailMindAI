const orderService = require('../services/orderService');
const { successResponse, paginatedResponse } = require('../utils/apiResponse');

class OrderController {
  async getAllOrders(req, res, next) {
    try {
      const { orders, total, page, limit } = await orderService.getAllOrders(req.query);
      return paginatedResponse(res, orders, total, page, limit, 'Orders retrieved');
    } catch (err) {
      next(err);
    }
  }

  async getOrderById(req, res, next) {
    try {
      const order = await orderService.getOrderById(req.params.id);
      if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
      return successResponse(res, order);
    } catch (err) {
      next(err);
    }
  }

  async createCustomerOrder(req, res, next) {
    try {
      const order = await orderService.createCustomerOrder(req.body, req.user);
      return successResponse(res, order, 'Order placed successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  async getCustomerOrders(req, res, next) {
    try {
      const customerId = req.user?.id || req.query.customerId;
      const { orders } = await orderService.getAllOrders({ customerId });
      return successResponse(res, orders, 'Customer order history retrieved');
    } catch (err) {
      next(err);
    }
  }

  async updateOrderStatus(req, res, next) {
    try {
      const { status } = req.body;
      const order = await orderService.updateOrderStatus(req.params.id, status, req.user);
      return successResponse(res, order, `Order status updated to ${status}`);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new OrderController();
