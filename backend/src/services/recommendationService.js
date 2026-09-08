const Product = require('../models/Product');
const Customer = require('../models/Customer');

class RecommendationService {
  /**
   * Generates sanitized, customer-safe product recommendations
   * @param {string} type 'personalized' | 'trending' | 'best-sellers' | 'frequently-bought-together'
   * @param {string} customerId
   */
  async getRecommendations(type = 'personalized', customerId = null) {
    const allProducts = await Product.find({ bit_IsActive: true });

    const sanitizeProductForCustomer = (p) => ({
      id: p.productId,
      name: p.name,
      sku: p.sku,
      category: p.category,
      brand: p.brand,
      unit: p.unit,
      price: p.price,
      originalPrice: p.originalPrice,
      discountPct: p.discountPct,
      image: p.image,
      rating: p.rating,
      ratingCount: p.ratingCount,
      inStock: p.stock > 0,
      tag: p.discountPct > 0 ? `${p.discountPct}% OFF` : 'Fresh Arrival',
    });

    if (type === 'best-sellers') {
      const sorted = [...allProducts].sort((a, b) => (b.unitsSold || 0) - (a.unitsSold || 0));
      return sorted.slice(0, 6).map(sanitizeProductForCustomer);
    }

    if (type === 'trending') {
      const trending = [...allProducts].sort((a, b) => (b.dailyVelocity || 0) - (a.dailyVelocity || 0));
      return trending.slice(0, 6).map(sanitizeProductForCustomer);
    }

    if (type === 'frequently-bought-together') {
      // Return complementary bundles (e.g. Bread + Milk + Coffee)
      const bundleSkus = ['MILK-001', 'BAK-102', 'BEV-882', 'OAT-109'];
      const bundleProducts = allProducts.filter((p) => bundleSkus.includes(p.sku));
      return (bundleProducts.length > 0 ? bundleProducts : allProducts.slice(0, 4)).map(
        sanitizeProductForCustomer
      );
    }

    // Default: Personalized
    // Highlight dairy, bakery, and fresh pantry items based on typical customer patterns
    const personalized = allProducts.filter(
      (p) =>
        p.category === 'Dairy & Eggs' ||
        p.category === 'Bakery & Snacks' ||
        p.category === 'Rice & Grains' ||
        p.discountPct > 0
    );

    return (personalized.length > 0 ? personalized : allProducts).slice(0, 6).map(
      sanitizeProductForCustomer
    );
  }
}

module.exports = new RecommendationService();
