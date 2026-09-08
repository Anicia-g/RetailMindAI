const categoryService = require('../services/categoryService');
const { successResponse } = require('../utils/apiResponse');

class CategoryController {
  async getAllCategories(req, res, next) {
    try {
      const categories = await categoryService.getAllCategories();
      return successResponse(res, categories, 'Categories fetched successfully');
    } catch (err) {
      next(err);
    }
  }

  async getCategoryById(req, res, next) {
    try {
      const category = await categoryService.getCategoryById(req.params.id);
      if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
      return successResponse(res, category);
    } catch (err) {
      next(err);
    }
  }

  async createCategory(req, res, next) {
    try {
      const category = await categoryService.createCategory(req.body, req.user);
      return successResponse(res, category, 'Category created successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  async updateCategory(req, res, next) {
    try {
      const category = await categoryService.updateCategory(req.params.id, req.body, req.user);
      return successResponse(res, category, 'Category updated successfully');
    } catch (err) {
      next(err);
    }
  }

  async deleteCategory(req, res, next) {
    try {
      const result = await categoryService.deleteCategory(req.params.id, req.user);
      return successResponse(res, result);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new CategoryController();
