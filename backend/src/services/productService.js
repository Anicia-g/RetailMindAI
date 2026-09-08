const Product = require('../models/Product');
const Inventory = require('../models/Inventory');

class ProductService {
  async getAllProducts(filters = {}) {
    const query = { bit_IsActive: true };

    if (filters.search) {
      const q = filters.search.trim();
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { sku: { $regex: q, $options: 'i' } },
        { brand: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } },
      ];
    }

    if (filters.category && filters.category !== 'All') {
      query.category = filters.category;
    }

    if (filters.brand && filters.brand !== 'All') {
      query.brand = filters.brand;
    }

    if (filters.stockStatus && filters.stockStatus !== 'All') {
      if (filters.stockStatus === 'Low Stock') {
        query.$expr = { $lte: ['$stock', '$reorderLevel'] };
      } else if (filters.stockStatus === 'Healthy') {
        query.$expr = { $gt: ['$stock', '$reorderLevel'] };
      } else {
        query.stockStatus = filters.stockStatus;
      }
    }

    if (filters.store && filters.store !== 'All') {
      query.$or = [
        { store: { $regex: filters.store, $options: 'i' } },
        { storeId: filters.store },
        { 'storeAssignments.storeId': filters.store },
        { 'storeAssignments.storeName': { $regex: filters.store, $options: 'i' } },
      ];
    }

    if (filters.demandLevel && filters.demandLevel !== 'All') {
      query.demandLevel = filters.demandLevel;
    }

    const sortOptions = {};
    if (filters.sortBy) {
      const sortOrder = filters.order === 'desc' ? -1 : 1;
      sortOptions[filters.sortBy] = sortOrder;
    } else {
      sortOptions.createdAt = -1;
    }

    const page = parseInt(filters.page || '1', 10);
    const limit = parseInt(filters.limit || '50', 10);
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find(query).sort(sortOptions).skip(skip).limit(limit),
      Product.countDocuments(query),
    ]);

    return { products, total, page, limit };
  }

  async getProductsByStore(storeIdOrName) {
    if (!storeIdOrName || storeIdOrName === 'All') {
      return await Product.find({ bit_IsActive: true });
    }

    const cleanStore = String(storeIdOrName).trim();
    return await Product.find({
      bit_IsActive: true,
      $or: [
        { storeId: cleanStore },
        { store: { $regex: cleanStore, $options: 'i' } },
        { 'storeAssignments.storeId': cleanStore },
        { 'storeAssignments.storeName': { $regex: cleanStore, $options: 'i' } },
      ],
    });
  }

  async getProductById(id) {
    const product = await Product.findOne({
      $or: [{ productId: id }, { sku: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
      bit_IsActive: true,
    });
    return product;
  }

  async createProduct(data, user = null) {
    const productId = data.productId || `prod-${Date.now()}`;
    const product = await Product.create({
      ...data,
      productId,
      originalPrice: data.originalPrice || data.price,
      txt_Created_By: user?.name || 'system',
    });

    // Also ensure corresponding Inventory document exists
    await Inventory.create({
      inventoryId: `inv-${productId}`,
      productId: product.productId,
      productName: product.name,
      sku: product.sku,
      category: product.category,
      image: product.image,
      store: product.store,
      storeId: product.storeId,
      currentStock: product.stock,
      minStock: product.reorderLevel,
      maxStock: product.stock * 3 || 100,
      dailyVelocity: product.dailyVelocity,
      supplier: product.supplier,
      supplierId: product.supplierId,
      status: product.stockStatus,
    });

    return product;
  }

  async updateProduct(id, data, user = null) {
    const product = await Product.findOneAndUpdate(
      {
        $or: [{ productId: id }, { sku: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
      },
      {
        ...data,
        txt_Modified_By: user?.name || 'system',
        dte_Modified_Date: new Date(),
      },
      { new: true, runValidators: true }
    );

    if (!product) {
      throw new Error(`Product with ID '${id}' not found.`);
    }

    // Keep Inventory in sync
    if (data.stock !== undefined || data.price !== undefined || data.reorderLevel !== undefined) {
      await Inventory.findOneAndUpdate(
        { productId: product.productId },
        {
          currentStock: product.stock,
          minStock: product.reorderLevel,
          status: product.stockStatus,
        }
      );
    }

    return product;
  }

  async deleteProduct(id, user = null) {
    const product = await Product.findOneAndUpdate(
      {
        $or: [{ productId: id }, { sku: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
      },
      {
        bit_IsActive: false,
        txt_Modified_By: user?.name || 'system',
        dte_Modified_Date: new Date(),
      },
      { new: true }
    );

    if (!product) {
      throw new Error(`Product with ID '${id}' not found.`);
    }

    return { message: 'Product deleted successfully.' };
  }

  async updateProductDiscount(productId, discountPct, user = null) {
    const numPct = Number(discountPct);
    const product = await this.getProductById(productId);
    if (!product) {
      throw new Error(`Product with ID '${productId}' not found.`);
    }

    const newPrice = Math.round(product.originalPrice * (1 - numPct / 100));
    product.discountPct = numPct;
    product.price = newPrice;
    product.txt_Modified_By = user?.name || 'system';
    product.dte_Modified_Date = new Date();

    await product.save();
    return product;
  }
}

module.exports = new ProductService();
