const BaseRepository = require('./baseRepository');

class ProductRepository extends BaseRepository {
  constructor() {
    super('tbl_Product', 'int_Product_Id');
  }

  toDTO(row) {
    if (!row) return null;
    const prodIdStr = `prod-${String(row.int_Product_Id).padStart(3, '0')}`;
    const price = Number(row.dec_Selling_Price || 0);
    const originalPrice = Number(row.dec_MRP || row.dec_Selling_Price || 0);
    const costPrice = Number(row.dec_Cost_Price || 0);
    const stock = row.current_stock !== undefined && row.current_stock !== null ? Number(row.current_stock) : Number(row.int_Reorder_Level ? row.int_Reorder_Level * 3 : 50);
    const reorderLevel = Number(row.int_Reorder_Level || 10);
    const imageUrl = row.txt_Product_Image_Url || row.txt_Image_URL || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80';

    let stockStatus = 'Healthy';
    if (stock <= reorderLevel / 2) stockStatus = 'Critical';
    else if (stock <= reorderLevel) stockStatus = 'Low Stock';

    return {
      _id: String(row.int_Product_Id),
      id: String(row.int_Product_Id),
      productId: prodIdStr,
      code: row.txt_Product_Code,
      name: row.txt_Product_Name,
      description: row.txt_Description || row.txt_Product_Name || '',
      sku: row.txt_SKU,
      barcode: row.txt_Barcode || '',
      categoryId: row.int_Category_Id,
      category: row.category_name || 'General Grocery',
      brandId: row.int_Brand_Id,
      brand: row.brand_name || 'RetailMind Basics',
      unitId: row.int_Unit_Id,
      unit: row.unit_symbol || 'pcs',
      taxId: row.int_Tax_Id,
      taxPct: row.tax_pct || 5.0,
      tax: Number(row.tax_pct || 5.0),
      price,
      sellingPrice: price,
      originalPrice,
      mrp: Number(row.dec_MRP || originalPrice),
      costPrice,
      discount: Number(row.dec_Discount_Percentage || 0),
      discountPct: Number(row.dec_Discount_Percentage || 0),
      discountPercentage: Number(row.dec_Discount_Percentage || 0),
      stock,
      currentStock: stock,
      stockStatus,
      reorderLevel,
      reorderQuantity: Number(row.int_Reorder_Quantity || 20),
      minStock: Number(row.int_Minimum_Stock_Level || 5),
      image: imageUrl,
      imageUrl: imageUrl,
      isPerishable: this.toBoolean(row.bit_Is_Perishable),
      shelfLifeDays: row.int_Shelf_Life_Days || 30,
      store: row.store_name || 'Indiranagar Flagship (Store 01)',
      storeId: row.int_Store_Id ? `store-${String(row.int_Store_Id).padStart(2, '0')}` : 'store-01',
      dailyVelocity: 2.5,
      expectedStockoutDays: stock > 0 ? Number((stock / 2.5).toFixed(1)) : 0,
      status: this.toBoolean(row.bit_IsActive) ? 'Active' : 'Inactive',
      bit_IsActive: this.toBoolean(row.bit_IsActive),
    };
  }

  async findProductById(identifier, connection = null) {
    if (!identifier) return null;
    const numericMatch = String(identifier).match(/\d+/);
    const numericId = numericMatch ? parseInt(numericMatch[0], 10) : (parseInt(identifier, 10) || null);

    const sql = `
      SELECT 
        p.*,
        c.txt_Category_Name AS category_name,
        b.txt_Brand_Name AS brand_name,
        u.txt_Unit_Symbol AS unit_symbol,
        t.dec_Tax_Rate AS tax_pct,
        i.int_Quantity_On_Hand AS current_stock,
        i.int_Reorder_Level,
        s.txt_Store_Name AS store_name
      FROM tbl_Product p
      LEFT JOIN tbl_Category c ON p.int_Category_Id = c.int_Category_Id
      LEFT JOIN tbl_Brand b ON p.int_Brand_Id = b.int_Brand_Id
      LEFT JOIN tbl_Unit u ON p.int_Unit_Id = u.int_Unit_Id
      LEFT JOIN tbl_Tax t ON p.int_Tax_Id = t.int_Tax_Id
      LEFT JOIN tbl_Inventory i ON p.int_Product_Id = i.int_Product_Id AND i.int_Store_Id = 1
      LEFT JOIN tbl_Store s ON i.int_Store_Id = s.int_Store_Id
      WHERE (p.int_Product_Id = ? OR p.txt_Product_Code = ? OR p.txt_SKU = ? OR p.txt_Barcode = ?)
        AND p.bit_IsActive = 1
      LIMIT 1
    `;

    const rows = await this.query(sql, [numericId || 0, identifier, identifier, identifier], connection);
    return rows[0] ? this.toDTO(rows[0]) : null;
  }

  async getById(identifier, connection = null) {
    return await this.findProductById(identifier, connection);
  }

  async findAllProducts(filters = {}, connection = null) {
    const storeId = filters.storeId && filters.storeId !== 'All' 
      ? (parseInt(String(filters.storeId).replace(/\D/g, ''), 10) || 1) 
      : 1;

    let sql = `
      SELECT 
        p.*,
        c.txt_Category_Name AS category_name,
        b.txt_Brand_Name AS brand_name,
        u.txt_Unit_Symbol AS unit_symbol,
        t.dec_Tax_Rate AS tax_pct,
        COALESCE(i.int_Quantity_On_Hand, 0) AS current_stock,
        COALESCE(i.int_Reorder_Level, 10) AS int_Reorder_Level,
        s.txt_Store_Name AS store_name
      FROM tbl_Product p
      LEFT JOIN tbl_Category c ON p.int_Category_Id = c.int_Category_Id
      LEFT JOIN tbl_Brand b ON p.int_Brand_Id = b.int_Brand_Id
      LEFT JOIN tbl_Unit u ON p.int_Unit_Id = u.int_Unit_Id
      LEFT JOIN tbl_Tax t ON p.int_Tax_Id = t.int_Tax_Id
      LEFT JOIN tbl_Inventory i ON p.int_Product_Id = i.int_Product_Id AND i.int_Store_Id = ?
      LEFT JOIN tbl_Store s ON i.int_Store_Id = s.int_Store_Id
      WHERE p.bit_IsActive = 1
    `;
    const params = [storeId];

    if (filters.search) {
      const q = `%${filters.search.trim()}%`;
      sql += ` AND (p.txt_Product_Name LIKE ? OR p.txt_SKU LIKE ? OR p.txt_Barcode LIKE ? OR p.txt_Product_Code LIKE ?)`;
      params.push(q, q, q, q);
    }

    if (filters.category && filters.category !== 'All') {
      const catNum = parseInt(String(filters.category).replace(/\D/g, ''), 10);
      if (!isNaN(catNum)) {
        sql += ` AND p.int_Category_Id = ?`;
        params.push(catNum);
      } else {
        sql += ` AND c.txt_Category_Name = ?`;
        params.push(filters.category);
      }
    }

    if (filters.brand && filters.brand !== 'All') {
      const brandNum = parseInt(String(filters.brand).replace(/\D/g, ''), 10);
      if (!isNaN(brandNum)) {
        sql += ` AND p.int_Brand_Id = ?`;
        params.push(brandNum);
      } else {
        sql += ` AND b.txt_Brand_Name = ?`;
        params.push(filters.brand);
      }
    }

    if (filters.stockStatus && filters.stockStatus !== 'All') {
      if (filters.stockStatus === 'Critical') {
        sql += ` AND COALESCE(i.int_Quantity_On_Hand, 0) <= COALESCE(i.int_Reorder_Level, 10) / 2`;
      } else if (filters.stockStatus === 'Low Stock') {
        sql += ` AND COALESCE(i.int_Quantity_On_Hand, 0) <= COALESCE(i.int_Reorder_Level, 10)`;
      } else if (filters.stockStatus === 'Healthy') {
        sql += ` AND COALESCE(i.int_Quantity_On_Hand, 0) > COALESCE(i.int_Reorder_Level, 10)`;
      }
    }

    sql += ` ORDER BY p.int_Product_Id ASC`;

    if (filters.limit) {
      const limit = parseInt(filters.limit, 10) || 50;
      const offset = ((parseInt(filters.page, 10) || 1) - 1) * limit;
      sql += ` LIMIT ? OFFSET ?`;
      params.push(limit, offset);
    }

    const rows = await this.query(sql, params, connection);
    return rows.map((r) => this.toDTO(r));
  }

  async countProducts(filters = {}, connection = null) {
    const storeId = filters.storeId && filters.storeId !== 'All' 
      ? (parseInt(String(filters.storeId).replace(/\D/g, ''), 10) || 1) 
      : 1;

    let sql = `
      SELECT COUNT(*) AS total 
      FROM tbl_Product p
      LEFT JOIN tbl_Category c ON p.int_Category_Id = c.int_Category_Id
      LEFT JOIN tbl_Brand b ON p.int_Brand_Id = b.int_Brand_Id
      LEFT JOIN tbl_Inventory i ON p.int_Product_Id = i.int_Product_Id AND i.int_Store_Id = ?
      WHERE p.bit_IsActive = 1
    `;
    const params = [storeId];

    if (filters.search) {
      const q = `%${filters.search.trim()}%`;
      sql += ` AND (p.txt_Product_Name LIKE ? OR p.txt_SKU LIKE ? OR p.txt_Barcode LIKE ?)`;
      params.push(q, q, q);
    }

    if (filters.category && filters.category !== 'All') {
      const catNum = parseInt(String(filters.category).replace(/\D/g, ''), 10);
      if (!isNaN(catNum)) {
        sql += ` AND p.int_Category_Id = ?`;
        params.push(catNum);
      } else {
        sql += ` AND c.txt_Category_Name = ?`;
        params.push(filters.category);
      }
    }

    const rows = await this.query(sql, params, connection);
    return rows[0]?.total || 0;
  }

  async createProduct(data, user = 'system', connection = null) {
    const prodId = data.int_Product_Id || await this.getNextId(connection);
    const auditData = this.withAuditInsert(data, user);
    const image = auditData.txt_Product_Image_Url || auditData.txt_Image_URL || auditData.image || null;
    const sql = `
      INSERT INTO tbl_Product (
        int_Product_Id,
        txt_Product_Code,
        txt_Product_Name,
        int_Category_Id,
        int_Brand_Id,
        int_Unit_Id,
        int_Tax_Id,
        txt_Barcode,
        txt_SKU,
        dec_Cost_Price,
        dec_Selling_Price,
        dec_MRP,
        dec_Discount_Percentage,
        int_Reorder_Level,
        int_Reorder_Quantity,
        int_Minimum_Stock_Level,
        int_Maximum_Stock_Level,
        txt_Product_Image_Url,
        dec_Weight,
        bit_Is_Perishable,
        int_Shelf_Life_Days,
        bit_Is_Discontinued,
        bit_Is_Serialized,
        dte_Created_Date,
        txt_Created_By,
        dte_Modified_Date,
        txt_Modified_By,
        bit_IsActive
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      prodId,
      auditData.txt_Product_Code || `PROD-${String(prodId).padStart(4, '0')}`,
      auditData.txt_Product_Name,
      auditData.int_Category_Id || 1,
      auditData.int_Brand_Id || 1,
      auditData.int_Unit_Id || 1,
      auditData.int_Tax_Id || 1,
      auditData.txt_Barcode || null,
      auditData.txt_SKU || `SKU-${prodId}`,
      auditData.dec_Cost_Price || 0,
      auditData.dec_Selling_Price || 0,
      auditData.dec_MRP || auditData.dec_Selling_Price || 0,
      auditData.dec_Discount_Percentage || 0,
      auditData.int_Reorder_Level || 10,
      auditData.int_Reorder_Quantity || 20,
      auditData.int_Minimum_Stock_Level || 5,
      auditData.int_Maximum_Stock_Level || 500,
      image,
      auditData.dec_Weight || 1.0,
      auditData.bit_Is_Perishable ? 1 : 0,
      auditData.int_Shelf_Life_Days || 30,
      auditData.bit_Is_Discontinued ? 1 : 0,
      auditData.bit_Is_Serialized ? 1 : 0,
      auditData.dte_Created_Date,
      auditData.txt_Created_By,
      auditData.dte_Modified_Date,
      auditData.txt_Modified_By,
      auditData.bit_IsActive,
    ];

    await this.execute(sql, params, connection);
    return { ...auditData, int_Product_Id: prodId };
  }

  async updateProduct(id, data, user = 'system', connection = null) {
    const auditData = this.withAuditUpdate(data, user);
    const image = data.txt_Product_Image_Url || data.txt_Image_URL || data.image;

    const sql = `
      UPDATE tbl_Product
      SET txt_Product_Name = COALESCE(?, txt_Product_Name),
          dec_Selling_Price = COALESCE(?, dec_Selling_Price),
          dec_MRP = COALESCE(?, dec_MRP),
          dec_Cost_Price = COALESCE(?, dec_Cost_Price),
          dec_Discount_Percentage = COALESCE(?, dec_Discount_Percentage),
          int_Reorder_Level = COALESCE(?, int_Reorder_Level),
          txt_Product_Image_Url = COALESCE(?, txt_Product_Image_Url),
          dte_Modified_Date = ?,
          txt_Modified_By = ?
      WHERE int_Product_Id = ?
    `;
    const params = [
      data.txt_Product_Name,
      data.dec_Selling_Price,
      data.dec_MRP,
      data.dec_Cost_Price,
      data.dec_Discount_Percentage,
      data.int_Reorder_Level,
      image,
      auditData.dte_Modified_Date,
      auditData.txt_Modified_By,
      id,
    ];
    await this.execute(sql, params, connection);
    return await this.findProductById(id, connection);
  }

  async updateDiscount(id, discountPct, user = 'system', connection = null) {
    const auditData = this.withAuditUpdate({}, user);
    const sql = `
      UPDATE tbl_Product
      SET dec_Discount_Percentage = ?,
          dte_Modified_Date = ?,
          txt_Modified_By = ?
      WHERE int_Product_Id = ?
    `;
    await this.execute(sql, [discountPct, auditData.dte_Modified_Date, auditData.txt_Modified_By, id], connection);
  }
}

module.exports = new ProductRepository();
