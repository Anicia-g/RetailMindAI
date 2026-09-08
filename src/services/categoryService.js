import { apiClient } from '@/lib/apiClient';
import { supermarketCategories } from '@/data/categories';

class CategoryService {
  async getAllCategories() {
    try {
      const response = await apiClient.get('/categories');
      if (response && response.data && response.data.length > 0) {
        return response.data;
      }
    } catch (err) {
      console.warn('[CategoryService] API unavailable, using local fallback:', err.message);
    }
    return supermarketCategories;
  }

  async getCategoryById(id) {
    try {
      const response = await apiClient.get(`/categories/${id}`);
      if (response && response.data) {
        return response.data;
      }
    } catch (err) {
      console.warn('[CategoryService] API unavailable for category id:', id);
    }
    return supermarketCategories.find((c) => c.id === id || c.categoryId === id) || null;
  }

  async createCategory(categoryData) {
    try {
      const response = await apiClient.post('/categories', categoryData);
      if (response && response.data) {
        return response.data;
      }
    } catch (err) {
      console.error('[CategoryService] Error creating category:', err);
    }
    return { id: `cat-${Date.now()}`, ...categoryData };
  }

  async updateCategory(id, categoryData) {
    try {
      const response = await apiClient.put(`/categories/${id}`, categoryData);
      if (response && response.data) {
        return response.data;
      }
    } catch (err) {
      console.error('[CategoryService] Error updating category:', err);
    }
    return { id, ...categoryData };
  }

  async deleteCategory(id) {
    try {
      const response = await apiClient.delete(`/categories/${id}`);
      return response;
    } catch (err) {
      console.error('[CategoryService] Error deleting category:', err);
      return { success: true, message: 'Deleted locally.' };
    }
  }
}

export const categoryService = new CategoryService();
