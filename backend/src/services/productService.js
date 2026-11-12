const productRepository = require('../repositories/productRepository');
const categoryRepository = require('../repositories/categoryRepository');

class ProductService {
  async getAllProducts(filters = {}) {
    const page = parseInt(filters.page || '1', 10);
    const limit = parseInt(filters.limit || '50', 10);

    const [products, total] = await Promise.all([
      productRepository.findAllProducts({ ...filters, page, limit }),
      productRepository.countProducts(filters),
    ]);

    return { products, total, page, limit };
  }

  async getProductsByStore(storeId) {
    return await productRepository.findAllProducts({ storeId });
  }

  async getProductById(id) {
    const product = await productRepository.findProductById(id);
    if (!product) {
      throw new Error(`Product '${id}' not found.`);
    }
    return product;
  }

  async createProduct(data, user = null) {
    let categoryId = data.categoryId;
    if (!categoryId && data.category) {
      const cat = await categoryRepository.findByName(data.category);
      if (cat) categoryId = cat.int_Category_Id;
    }

    const newProd = await productRepository.createProduct(
      {
        txt_Product_Name: data.name,
        txt_Product_Code: data.code || `PROD-${Date.now().toString().slice(-4)}`,
        txt_Generic_Name: data.description || data.genericName || '',
        txt_SKU: data.sku || `SKU-${Date.now()}`,
        txt_Barcode: data.barcode || '',
        int_Category_Id: categoryId || 1,
        int_Brand_Id: data.brandId || 1,
        int_Unit_Id: data.unitId || 1,
        int_Tax_Id: data.taxId || 1,
        dec_Cost_Price: Number(data.costPrice || data.price * 0.7 || 0),
        dec_Selling_Price: Number(data.price || data.sellingPrice || 0),
        dec_MRP: Number(data.mrp || data.originalPrice || data.price || 0),
        dec_Discount_Percentage: Number(data.discount || data.discountPct || 0),
        int_Reorder_Level: Number(data.reorderLevel || 10),
        int_Reorder_Quantity: Number(data.reorderQuantity || 20),
        int_Minimum_Stock_Level: Number(data.minStock || 5),
        txt_Product_Image_URL: data.image || null,
        bit_Is_Perishable: data.isPerishable ? 1 : 0,
        int_Shelf_Life_Days: data.shelfLifeDays || 30,
      },
      user?.name || 'system'
    );

    return await productRepository.findProductById(newProd.int_Product_Id);
  }

  async updateProduct(id, data, user = null) {
    const existing = await productRepository.findProductById(id);
    if (!existing) {
      throw new Error(`Product '${id}' not found.`);
    }

    const updated = await productRepository.updateProduct(
      existing.id,
      {
        txt_Product_Name: data.name,
        txt_Generic_Name: data.description || data.genericName,
        dec_Selling_Price: data.price !== undefined ? Number(data.price) : undefined,
        dec_MRP: data.originalPrice !== undefined ? Number(data.originalPrice) : undefined,
        dec_Cost_Price: data.costPrice !== undefined ? Number(data.costPrice) : undefined,
        dec_Discount_Percentage: data.discount !== undefined ? Number(data.discount) : undefined,
        int_Reorder_Level: data.reorderLevel !== undefined ? Number(data.reorderLevel) : undefined,
        txt_Product_Image_URL: data.image,
      },
      user?.name || 'system'
    );

    return updated;
  }

  async deleteProduct(id, user = null) {
    const existing = await productRepository.findProductById(id);
    if (!existing) {
      throw new Error(`Product '${id}' not found.`);
    }
    return await productRepository.softDelete(existing.id, user?.name || 'system');
  }

  async updateDiscount(id, discountPct, user = null) {
    const existing = await productRepository.findProductById(id);
    if (!existing) {
      throw new Error(`Product '${id}' not found.`);
    }
    await productRepository.updateDiscount(existing.id, discountPct, user?.name || 'system');
    return await productRepository.findProductById(existing.id);
  }
}

module.exports = new ProductService();
