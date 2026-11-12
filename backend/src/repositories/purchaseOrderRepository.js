const BaseRepository = require('./baseRepository');

class PurchaseOrderRepository extends BaseRepository {
  constructor() {
    super('tbl_Purchase_Order', 'int_Purchase_Order_Id');
  }

  toDTO(row, items = []) {
    if (!row) return null;
    const poIdStr = `PO-${String(row.int_Purchase_Order_Id).padStart(4, '0')}`;
    const supIdStr = row.int_Supplier_Id ? `sup-${String(row.int_Supplier_Id).padStart(2, '0')}` : 'sup-01';

    return {
      _id: String(row.int_Purchase_Order_Id),
      id: String(row.int_Purchase_Order_Id),
      poId: poIdStr,
      poNumber: row.txt_PO_Number,
      supplierId: supIdStr,
      supplierName: row.supplier_name || 'Nandini Dairy Cooperative',
      storeId: row.int_Store_Id ? `store-${String(row.int_Store_Id).padStart(2, '0')}` : 'store-01',
      items: items.map((i) => ({
        id: String(i.int_Purchase_Order_Item_Id || i.id),
        productId: `prod-${String(i.int_Product_Id).padStart(3, '0')}`,
        internalProductId: i.int_Product_Id,
        name: i.txt_Product_Name || i.name,
        sku: i.txt_SKU || i.sku,
        quantity: Number(i.int_Ordered_Quantity || i.quantity || 1),
        unitCost: Number(i.dec_Unit_Cost || i.unitCost || 0),
        total: Number(i.dec_Total_Amount || i.dec_Line_Total || (i.int_Ordered_Quantity * i.dec_Unit_Cost) || 0),
      })),
      totalCost: Number(row.dec_Total_Amount || 0),
      status: row.txt_PO_Status || 'Pending',
      expectedDelivery: row.dte_Expected_Delivery_Date ? String(row.dte_Expected_Delivery_Date).slice(0, 10) : '2026-03-30',
      createdAt: row.dte_PO_Date || row.dte_Created_Date,
      bit_IsActive: this.toBoolean(row.bit_IsActive),
    };
  }

  async findPOById(identifier, connection = null) {
    const numericMatch = String(identifier).match(/\d+/);
    const numericId = numericMatch ? parseInt(numericMatch[0], 10) : (parseInt(identifier, 10) || null);

    const sql = `
      SELECT 
        po.*,
        s.txt_Supplier_Name AS supplier_name
      FROM tbl_Purchase_Order po
      LEFT JOIN tbl_Supplier s ON po.int_Supplier_Id = s.int_Supplier_Id
      WHERE (po.int_Purchase_Order_Id = ? OR po.txt_PO_Number = ?)
        AND po.bit_IsActive = 1
      LIMIT 1
    `;

    const rows = await this.query(sql, [numericId || 0, identifier], connection);
    if (!rows[0]) return null;

    const itemSql = `
      SELECT 
        poi.*,
        p.txt_Product_Name,
        p.txt_SKU
      FROM tbl_Purchase_Order_Item poi
      JOIN tbl_Product p ON poi.int_Product_Id = p.int_Product_Id
      WHERE poi.int_Purchase_Order_Id = ? AND poi.bit_IsActive = 1
    `;
    const items = await this.query(itemSql, [rows[0].int_Purchase_Order_Id], connection);
    return this.toDTO(rows[0], items);
  }

  async findAllPOs(filters = {}, connection = null) {
    let sql = `
      SELECT 
        po.*,
        s.txt_Supplier_Name AS supplier_name
      FROM tbl_Purchase_Order po
      LEFT JOIN tbl_Supplier s ON po.int_Supplier_Id = s.int_Supplier_Id
      WHERE po.bit_IsActive = 1
    `;
    const params = [];

    if (filters.status && filters.status !== 'All') {
      sql += ` AND po.txt_PO_Status = ?`;
      params.push(filters.status);
    }

    if (filters.supplierId) {
      const supNum = parseInt(String(filters.supplierId).replace(/\D/g, ''), 10);
      if (!isNaN(supNum)) {
        sql += ` AND po.int_Supplier_Id = ?`;
        params.push(supNum);
      }
    }

    sql += ` ORDER BY po.dte_PO_Date DESC`;
    const rows = await this.query(sql, params, connection);
    if (rows.length === 0) return [];

    const poIds = rows.map((r) => r.int_Purchase_Order_Id);
    const itemSql = `
      SELECT 
        poi.*,
        p.txt_Product_Name,
        p.txt_SKU
      FROM tbl_Purchase_Order_Item poi
      JOIN tbl_Product p ON poi.int_Product_Id = p.int_Product_Id
      WHERE poi.int_Purchase_Order_Id IN (${poIds.map(() => '?').join(',')}) AND poi.bit_IsActive = 1
    `;
    const allItems = await this.query(itemSql, poIds, connection);
    const itemsByPoId = {};
    allItems.forEach((i) => {
      if (!itemsByPoId[i.int_Purchase_Order_Id]) itemsByPoId[i.int_Purchase_Order_Id] = [];
      itemsByPoId[i.int_Purchase_Order_Id].push(i);
    });

    return rows.map((r) => this.toDTO(r, itemsByPoId[r.int_Purchase_Order_Id] || []));
  }

  async createPO(data, user = 'system', connection = null) {
    const poId = data.int_Purchase_Order_Id || await this.getNextId(connection);
    const auditData = this.withAuditInsert(data, user);
    const sql = `
      INSERT INTO tbl_Purchase_Order (
        int_Purchase_Order_Id,
        txt_PO_Number,
        int_Supplier_Id,
        int_Store_Id,
        int_Warehouse_Id,
        int_Created_By_User_Id,
        dte_PO_Date,
        dte_Expected_Delivery_Date,
        txt_PO_Status,
        dec_Subtotal_Amount,
        dec_Tax_Amount,
        dec_Discount_Amount,
        dec_Total_Amount,
        txt_Approval_Status,
        txt_Currency_Code,
        txt_Remarks,
        dte_Created_Date,
        txt_Created_By,
        dte_Modified_Date,
        txt_Modified_By,
        bit_IsActive
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      poId,
      auditData.txt_PO_Number,
      auditData.int_Supplier_Id || 1,
      auditData.int_Store_Id || 1,
      auditData.int_Warehouse_Id || 1,
      auditData.int_Created_By_User_Id || 1,
      auditData.dte_PO_Date ? this.formatDateTime(auditData.dte_PO_Date) : this.formatDateTime(new Date()),
      auditData.dte_Expected_Delivery_Date ? this.formatDate(auditData.dte_Expected_Delivery_Date) : this.formatDate(new Date(Date.now() + 7 * 86400000)),
      auditData.txt_PO_Status || 'Pending',
      auditData.dec_Subtotal_Amount || 0,
      auditData.dec_Tax_Amount || 0,
      auditData.dec_Discount_Amount || 0,
      auditData.dec_Total_Amount || 0,
      auditData.txt_Approval_Status || 'Approved',
      auditData.txt_Currency_Code || 'INR',
      auditData.txt_Remarks || auditData.txt_Payment_Terms || null,
      auditData.dte_Created_Date,
      auditData.txt_Created_By,
      auditData.dte_Modified_Date,
      auditData.txt_Modified_By,
      auditData.bit_IsActive,
    ];

    await this.execute(sql, params, connection);
    return { ...auditData, int_Purchase_Order_Id: poId };
  }

  async updateStatus(id, status, user = 'system', connection = null) {
    const now = this.formatDateTime(new Date());
    const sql = `
      UPDATE tbl_Purchase_Order
      SET txt_PO_Status = ?,
          dte_Modified_Date = ?,
          txt_Modified_By = ?
      WHERE int_Purchase_Order_Id = ? OR txt_PO_Number = ?
    `;
    await this.execute(sql, [status, now, user, id, id], connection);
  }
}

module.exports = new PurchaseOrderRepository();
