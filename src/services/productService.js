import { initialProducts } from '@/data/products';

/**
 * Product Service (API-ready abstraction layer)
 * Ready to be connected to future REST/GraphQL endpoints without UI refactoring.
 */
class ProductService {
  constructor() {
    this.products = [...initialProducts];
  }

  async getAllProducts(filters = {}) {
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
      list = list.filter((p) => p.store === filters.store || p.storeAssignments?.some(a => a.storeName.includes(filters.store)));
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
    if (!storeIdOrName) return this.products;
    return this.products.filter(
      (p) =>
        p.storeId === storeIdOrName ||
        p.store?.includes(storeIdOrName) ||
        p.storeAssignments?.some((a) => a.storeId === storeIdOrName || a.storeName.includes(storeIdOrName))
    );
  }

  async getProductById(id) {
    return this.products.find((p) => p.id === id) || null;
  }

  async updateProductDiscount(productId, discountPct) {
    this.products = this.products.map((p) => {
      if (p.id === productId) {
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
