const Category = require('../models/Category');

class CategoryService {
  async getAllCategories() {
    return await Category.find({ bit_IsActive: true }).sort({ name: 1 });
  }

  async getCategoryById(id) {
    return await Category.findOne({
      $or: [{ categoryId: id }, { name: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
      bit_IsActive: true,
    });
  }

  async createCategory(data, user = null) {
    const categoryId = data.categoryId || `cat-${Date.now()}`;
    return await Category.create({
      ...data,
      categoryId,
      txt_Created_By: user?.name || 'system',
    });
  }

  async updateCategory(id, data, user = null) {
    const category = await Category.findOneAndUpdate(
      {
        $or: [{ categoryId: id }, { name: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
      },
      {
        ...data,
        txt_Modified_By: user?.name || 'system',
        dte_Modified_Date: new Date(),
      },
      { new: true, runValidators: true }
    );

    if (!category) {
      throw new Error(`Category '${id}' not found.`);
    }

    return category;
  }

  async deleteCategory(id, user = null) {
    const category = await Category.findOneAndUpdate(
      {
        $or: [{ categoryId: id }, { name: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
      },
      {
        bit_IsActive: false,
        txt_Modified_By: user?.name || 'system',
        dte_Modified_Date: new Date(),
      },
      { new: true }
    );

    if (!category) {
      throw new Error(`Category '${id}' not found.`);
    }

    return { message: 'Category removed successfully.' };
  }
}

module.exports = new CategoryService();
