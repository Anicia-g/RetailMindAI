const categoryRepository = require('../repositories/categoryRepository');

class CategoryService {
  async getAllCategories() {
    const rows = await categoryRepository.findAll();
    return rows.map((r) => categoryRepository.toDTO(r));
  }

  async getCategoryById(id) {
    const row = await categoryRepository.findByIdOrName(id);
    if (!row) {
      throw new Error(`Category '${id}' not found.`);
    }
    return categoryRepository.toDTO(row);
  }

  async createCategory(data, user = null) {
    const newCat = await categoryRepository.createCategory(
      {
        txt_Category_Name: data.name,
        txt_Category_Code: data.code || `CAT-${Date.now().toString().slice(-4)}`,
        txt_Category_Description: data.description || '',
        txt_Category_Image_Url: data.image || data.icon || null,
        bit_Is_Perishable: data.isPerishable ? 1 : 0,
      },
      user?.name || 'system'
    );
    return categoryRepository.toDTO(newCat);
  }

  async updateCategory(id, data, user = null) {
    const existing = await categoryRepository.findByIdOrName(id);
    if (!existing) {
      throw new Error(`Category '${id}' not found.`);
    }
    const updated = await categoryRepository.updateCategory(
      existing.int_Category_Id,
      {
        txt_Category_Name: data.name,
        txt_Category_Description: data.description,
        txt_Department: data.department,
        txt_Category_Image_Url: data.image,
      },
      user?.name || 'system'
    );
    return categoryRepository.toDTO(updated);
  }

  async deleteCategory(id, user = null) {
    const existing = await categoryRepository.findByIdOrName(id);
    if (!existing) {
      throw new Error(`Category '${id}' not found.`);
    }
    return await categoryRepository.softDelete(existing.int_Category_Id, user?.name || 'system');
  }
}

module.exports = new CategoryService();
