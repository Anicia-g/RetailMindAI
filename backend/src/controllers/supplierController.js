const supplierService = require('../services/supplierService');
const { successResponse } = require('../utils/apiResponse');

class SupplierController {
  async getAllSuppliers(req, res, next) {
    try {
      const suppliers = await supplierService.getAllSuppliers();
      return successResponse(res, suppliers, 'Suppliers retrieved');
    } catch (err) {
      next(err);
    }
  }

  async getSupplierById(req, res, next) {
    try {
      const supplier = await supplierService.getSupplierById(req.params.id);
      if (!supplier) return res.status(404).json({ success: false, message: 'Supplier not found' });
      return successResponse(res, supplier);
    } catch (err) {
      next(err);
    }
  }

  async createSupplier(req, res, next) {
    try {
      const supplier = await supplierService.createSupplier(req.body, req.user);
      return successResponse(res, supplier, 'Supplier created', 201);
    } catch (err) {
      next(err);
    }
  }

  async updateSupplier(req, res, next) {
    try {
      const supplier = await supplierService.updateSupplier(req.params.id, req.body, req.user);
      return successResponse(res, supplier, 'Supplier updated');
    } catch (err) {
      next(err);
    }
  }

  async deleteSupplier(req, res, next) {
    try {
      const result = await supplierService.deleteSupplier(req.params.id, req.user);
      return successResponse(res, result);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new SupplierController();
