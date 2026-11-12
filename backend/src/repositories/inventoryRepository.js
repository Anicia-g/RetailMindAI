const BaseRepository = require('./baseRepository');

class InventoryRepository extends BaseRepository {
  constructor() {
    super('tbl_Inventory', 'int_Inventory_Id');
  }

  toDTO(row) {
    if (!row) return null;
    const invIdStr = `inv-prod-${String(row.int_Product_Id).padStart(3, '0')}`;
    const prodIdStr = `prod-${String(row.int_Product_Id).padStart(3, '0')}`;
    const stock = Number(row.int_Quantity_On_Hand || 0);
    const reorderLevel = Number(row.int_Reorder_Level || 10);

    let status = 'Healthy';
    let riskLevel = 'Low';
    if (stock <= reorderLevel / 2) {
      status = 'Critical';
      riskLevel = 'Critical';
    } else if (stock <= reorderLevel) {
      status = 'Low Stock';
      riskLevel = 'High';
    }

    const daysRemaining = stock > 0 ? Number((stock / 2.5).toFixed(1)) : 0;

    return {
      _id: String(row.int_Inventory_Id),
      id: String(row.int_Inventory_Id),
      inventoryId: invIdStr,
      productId: prodIdStr,
      internalProductId: row.int_Product_Id,
      productName: row.txt_Product_Name || 'Product',
      sku: row.txt_SKU || `SKU-${row.int_Product_Id}`,
      category: row.category_name || 'General Grocery',
      image: row.txt_Product_Image_Url || '',
      store: row.txt_Store_Name || 'Indiranagar Flagship (Store 01)',
      storeId: row.int_Store_Id ? `store-${String(row.int_Store_Id).padStart(2, '0')}` : 'store-01',
      internalStoreId: row.int_Store_Id,
      currentStock: stock,
      stock,
      reservedStock: Number(row.int_Quantity_Reserved || 0),
      availableStock: Number(row.int_Quantity_Available || stock),
      damagedStock: Number(row.int_Quantity_Damaged || 0),
      minStock: reorderLevel,
      reorderLevel,
      status,
      riskLevel,
      daysRemaining,
      lastRestocked: row.dte_Last_Restocked_Date ? String(row.dte_Last_Restocked_Date).slice(0, 10) : 'Recently',
      batchNumber: row.txt_Batch_Number,
      expiryDate: row.dte_Expiry_Date,
      binLocation: row.txt_Bin_Location || 'Aisle 1',
      bit_IsActive: this.toBoolean(row.bit_IsActive),
    };
  }

  async findByProductAndStore(productId, storeId = 1, connection = null) {
    const numericProdMatch = String(productId).match(/\d+/);
    const numericProdId = numericProdMatch ? parseInt(numericProdMatch[0], 10) : (parseInt(productId, 10) || 1);
    const numericStoreMatch = String(storeId).match(/\d+/);
    const numericStoreId = numericStoreMatch ? parseInt(numericStoreMatch[0], 10) : (parseInt(storeId, 10) || 1);

    const sql = `
      SELECT 
        inv.*,
        p.txt_Product_Name,
        p.txt_SKU,
        p.txt_Product_Image_Url,
        p.int_Reorder_Level,
        c.txt_Category_Name AS category_name,
        s.txt_Store_Name
      FROM tbl_Inventory inv
      JOIN tbl_Product p ON inv.int_Product_Id = p.int_Product_Id
      LEFT JOIN tbl_Category c ON p.int_Category_Id = c.int_Category_Id
      LEFT JOIN tbl_Store s ON inv.int_Store_Id = s.int_Store_Id
      WHERE inv.int_Product_Id = ? AND (inv.int_Store_Id = ? OR inv.int_Store_Id IS NULL)
        AND inv.bit_IsActive = 1
      LIMIT 1
    `;
    const rows = await this.query(sql, [numericProdId, numericStoreId], connection);
    return rows[0] || null;
  }

  async findAllInventory(filters = {}, connection = null) {
    let sql = `
      SELECT 
        inv.*,
        p.txt_Product_Name,
        p.txt_SKU,
        p.txt_Product_Image_Url,
        p.int_Reorder_Level,
        c.txt_Category_Name AS category_name,
        s.txt_Store_Name
      FROM tbl_Inventory inv
      JOIN tbl_Product p ON inv.int_Product_Id = p.int_Product_Id
      LEFT JOIN tbl_Category c ON p.int_Category_Id = c.int_Category_Id
      LEFT JOIN tbl_Store s ON inv.int_Store_Id = s.int_Store_Id
      WHERE inv.bit_IsActive = 1
    `;
    const params = [];

    if (filters.search) {
      const q = `%${filters.search.trim()}%`;
      sql += ` AND (p.txt_Product_Name LIKE ? OR p.txt_SKU LIKE ? OR c.txt_Category_Name LIKE ?)`;
      params.push(q, q, q);
    }

    if (filters.category && filters.category !== 'All') {
      sql += ` AND (c.txt_Category_Name = ? OR p.int_Category_Id = ?)`;
      params.push(filters.category, parseInt(filters.category, 10) || 0);
    }

    if (filters.store && filters.store !== 'All') {
      const storeNum = parseInt(String(filters.store).replace(/\D/g, ''), 10) || 1;
      sql += ` AND (inv.int_Store_Id = ? OR s.txt_Store_Name LIKE ?)`;
      params.push(storeNum, `%${filters.store}%`);
    }

    sql += ` ORDER BY inv.int_Quantity_On_Hand ASC`;
    const rows = await this.query(sql, params, connection);
    return rows.map((r) => this.toDTO(r));
  }

  async upsertStock(productId, storeId, newStock, user = 'system', connection = null) {
    const existing = await this.findByProductAndStore(productId, storeId, connection);
    const now = this.formatDateTime(new Date());

    if (existing) {
      const sql = `
        UPDATE tbl_Inventory
        SET int_Quantity_On_Hand = ?,
            int_Quantity_Available = ?,
            dte_Last_Restocked_Date = ?,
            dte_Modified_Date = ?,
            txt_Modified_By = ?
        WHERE int_Inventory_Id = ?
      `;
      await this.execute(sql, [newStock, newStock, now, now, user, existing.int_Inventory_Id], connection);
      return await this.findById(existing.int_Inventory_Id, connection);
    } else {
      const invId = await this.getNextId(connection);
      const auditData = this.withAuditInsert(
        {
          int_Inventory_Id: invId,
          int_Product_Id: productId,
          int_Store_Id: storeId || 1,
          int_Warehouse_Id: 1,
          int_Quantity_On_Hand: newStock,
          int_Quantity_Reserved: 0,
          int_Quantity_Available: newStock,
          int_Quantity_Damaged: 0,
          dte_Last_Restocked_Date: now,
          bit_Is_Cycle_Count_Due: 0,
        },
        user
      );

      const sql = `
        INSERT INTO tbl_Inventory (
          int_Inventory_Id,
          int_Product_Id,
          int_Store_Id,
          int_Warehouse_Id,
          int_Quantity_On_Hand,
          int_Quantity_Reserved,
          int_Quantity_Available,
          int_Quantity_Damaged,
          dte_Last_Restocked_Date,
          bit_Is_Cycle_Count_Due,
          dte_Created_Date,
          txt_Created_By,
          dte_Modified_Date,
          txt_Modified_By,
          bit_IsActive
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const params = [
        invId,
        auditData.int_Product_Id,
        auditData.int_Store_Id,
        auditData.int_Warehouse_Id,
        auditData.int_Quantity_On_Hand,
        auditData.int_Quantity_Reserved,
        auditData.int_Quantity_Available,
        auditData.int_Quantity_Damaged,
        auditData.dte_Last_Restocked_Date,
        auditData.bit_Is_Cycle_Count_Due,
        auditData.dte_Created_Date,
        auditData.txt_Created_By,
        auditData.dte_Modified_Date,
        auditData.txt_Modified_By,
        auditData.bit_IsActive,
      ];
      await this.execute(sql, params, connection);
      return { ...auditData, int_Inventory_Id: invId };
    }
  }
}

module.exports = new InventoryRepository();
