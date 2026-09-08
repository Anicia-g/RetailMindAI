import { initialProducts } from '@/data/products';
import { apiClient } from '@/lib/apiClient';

/**
 * Product Service (Connected to Express REST Backend with resilient fallback)
 */
class ProductService {
  constructor() {
    this.products = [...initialProducts];
  }

  async getAllProducts(filters = {}) {
    try {
      const response = await apiClient.get('/products', filters);
      if (response && response.data) {
        return response.data;
      }
    } catch (err) {
      // Fallback to local filtering if backend is unreachable
    }

    let list = [...this.products];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.brand?.toLowerCase().includes(q)
      );
    }

    if (filters.category && filters.category !== 'All') {
      list = list.filter((p) => p.category === filters.category);
    }

    if (filters.seller && filters.seller !== 'All') {
      list = list.filter((p) => p.seller === filters.seller);
    }

    if (filters.store && filters.store !== 'All') {
      list = list.filter(
        (p) =>
          p.store === filters.store ||
          p.storeAssignments?.some((a) => a.storeName.includes(filters.store))
      );
    }

    if (filters.stockStatus && filters.stockStatus !== 'All') {
      list = list.filter((p) => {
        if (filters.stockStatus === 'Low Stock') return p.stock <= p.reorderLevel;
        if (filters.stockStatus === 'Healthy') return p.stock > p.reorderLevel;
        return p.stockStatus === filters.stockStatus;
      });
    }

    return list;
  }

  async getProductsByStore(storeIdOrName) {
    try {
      const response = await apiClient.get('/seller/products', { store: storeIdOrName });
      if (response && response.data) {
        return response.data;
      }
    } catch (err) {}

    if (!storeIdOrName) return this.products;
    return this.products.filter(
      (p) =>
        p.storeId === storeIdOrName ||
        p.store?.includes(storeIdOrName) ||
        p.storeAssignments?.some(
          (a) => a.storeId === storeIdOrName || a.storeName.includes(storeIdOrName)
        )
    );
  }

  async getProductById(id) {
    try {
      const response = await apiClient.get(`/products/${id}`);
      if (response && response.data) {
        return response.data;
      }
    } catch (err) {}

    return this.products.find((p) => p.id === id || p.productId === id || p.sku === id) || null;
  }

  async createProduct(productData) {
    try {
      const response = await apiClient.post('/products', productData);
      if (response && response.data) {
        return response.data;
      }
    } catch (err) {
      console.error('[ProductService] Error creating product:', err);
    }
    const newProd = {
      id: `prod-${Date.now().toString().slice(-4)}`,
      productId: `prod-${Date.now().toString().slice(-4)}`,
      ...productData,
    };
    this.products.unshift(newProd);
    return newProd;
  }

  async updateProduct(id, productData) {
    try {
      const response = await apiClient.put(`/products/${id}`, productData);
      if (response && response.data) {
        return response.data;
      }
    } catch (err) {
      console.error('[ProductService] Error updating product:', err);
    }
    this.products = this.products.map((p) => (p.id === id || p.productId === id ? { ...p, ...productData } : p));
    return { id, ...productData };
  }

  async deleteProduct(id) {
    try {
      return await apiClient.delete(`/products/${id}`);
    } catch (err) {
      console.error('[ProductService] Error deleting product:', err);
      this.products = this.products.filter((p) => p.id !== id && p.productId !== id);
      return { success: true, message: 'Deleted locally.' };
    }
  }

  async updateProductDiscount(productId, discountPct) {
    try {
      const response = await apiClient.patch(`/products/${productId}/discount`, { discountPct });
      if (response && response.data) {
        return response.data;
      }
    } catch (err) {}

    this.products = this.products.map((p) => {
      if (p.id === productId || p.productId === productId) {
        return {
          ...p,
          discountPct: Number(discountPct),
          price: Math.round(p.originalPrice * (1 - Number(discountPct) / 100)),
        };
      }
      return p;
    });
    return this.getProductById(productId);
  }
}

export const productService = new ProductService();
