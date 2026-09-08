const productService = require('../services/productService');
const { successResponse, paginatedResponse } = require('../utils/apiResponse');

class ProductController {
  async getAllProducts(req, res, next) {
    try {
      const { products, total, page, limit } = await productService.getAllProducts(req.query);
      return paginatedResponse(res, products, total, page, limit, 'Products fetched successfully');
    } catch (err) {
      next(err);
    }
  }

  async getProductsByStore(req, res, next) {
    try {
      const storeId = req.params.storeId || req.query.store || req.user?.storeId;
      const products = await productService.getProductsByStore(storeId);
      return successResponse(res, products, 'Store products fetched successfully');
    } catch (err) {
      next(err);
    }
  }

  async getProductById(req, res, next) {
    try {
      const product = await productService.getProductById(req.params.id);
      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }
      return successResponse(res, product, 'Product fetched successfully');
    } catch (err) {
      next(err);
    }
  }

  async createProduct(req, res, next) {
    try {
      const product = await productService.createProduct(req.body, req.user);
      return successResponse(res, product, 'Product created successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  async updateProduct(req, res, next) {
    try {
      const product = await productService.updateProduct(req.params.id, req.body, req.user);
      return successResponse(res, product, 'Product updated successfully');
    } catch (err) {
      next(err);
    }
  }

  async deleteProduct(req, res, next) {
    try {
      const result = await productService.deleteProduct(req.params.id, req.user);
      return successResponse(res, result, 'Product deleted successfully');
    } catch (err) {
      next(err);
    }
  }

  async updateDiscount(req, res, next) {
    try {
      const { discountPct } = req.body;
      const product = await productService.updateProductDiscount(req.params.id, discountPct, req.user);
      return successResponse(res, product, `Discount updated to ${discountPct}%`);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ProductController();
