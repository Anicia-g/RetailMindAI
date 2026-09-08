const posService = require('../services/posService');
const { successResponse } = require('../utils/apiResponse');

class PosController {
  async processSale(req, res, next) {
    try {
      const saleResult = await posService.processSale(req.body, req.user);
      return successResponse(res, saleResult, saleResult.message, 201);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new PosController();
