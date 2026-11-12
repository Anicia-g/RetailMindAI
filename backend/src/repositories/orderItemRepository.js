const BaseRepository = require('./baseRepository');

class OrderItemRepository extends BaseRepository {
  constructor() {
    super('tbl_Order_Item', 'int_Order_Item_Id');
  }

  toDTO(row) {
    if (!row) return null;
    return {
      _id: String(row.int_Order_Item_Id),
      id: String(row.int_Order_Item_Id),
      orderItemId: row.int_Order_Item_Id,
      orderId: row.int_Order_Id,
      productId: row.int_Product_Id,
      unitId: row.int_Unit_Id,
      quantity: Number(row.int_Quantity || 0),
      unitCost: Number(row.dec_Unit_Cost || 0),
      unitPrice: Number(row.dec_Unit_Price || 0),
      discountPercentage: Number(row.dec_Discount_Percentage || 0),
      discountAmount: Number(row.dec_Discount_Amount || 0),
      taxPercentage: Number(row.dec_Tax_Percentage || row.dec_Tax_Rate || 0),
      taxAmount: Number(row.dec_Tax_Amount || 0),
      subtotal: Number(row.dec_Subtotal || (row.int_Quantity * row.dec_Unit_Price) || 0),
      total: Number(row.dec_Line_Total || (row.int_Quantity * row.dec_Unit_Price) || 0),
      batchNumber: row.txt_Batch_Number,
      bit_IsActive: this.toBoolean(row.bit_IsActive),
    };
  }

  async createOrderItem(data, user = 'system', connection = null) {
    const itemId = data.int_Order_Item_Id || await this.getNextId(connection);
    const auditData = this.withAuditInsert(data, user);
    const qty = auditData.int_Quantity || 1;
    const unitPrice = auditData.dec_Unit_Price != null ? auditData.dec_Unit_Price : 0;
    const unitCost = auditData.dec_Unit_Cost != null ? auditData.dec_Unit_Cost : (auditData.dec_Cost_Price_At_Sale || 0);
    const discountAmt = auditData.dec_Discount_Amount != null ? auditData.dec_Discount_Amount : 0;
    const taxAmt = auditData.dec_Tax_Amount != null ? auditData.dec_Tax_Amount : 0;
    const subtotal = auditData.dec_Subtotal != null ? auditData.dec_Subtotal : (auditData.dec_Subtotal_Amount != null ? auditData.dec_Subtotal_Amount : (qty * unitPrice));
    const lineTotal = auditData.dec_Line_Total != null ? auditData.dec_Line_Total : (auditData.dec_Total_Amount != null ? auditData.dec_Total_Amount : (auditData.total != null ? auditData.total : (subtotal + taxAmt - discountAmt)));

    const sql = `
      INSERT INTO tbl_Order_Item (
        int_Order_Item_Id,
        int_Order_Id,
        int_Product_Id,
        int_Unit_Id,
        int_Quantity,
        dec_Unit_Cost,
        dec_Unit_Price,
        dec_Discount_Percentage,
        dec_Discount_Amount,
        dec_Tax_Percentage,
        dec_Tax_Amount,
        dec_Subtotal,
        dec_Line_Total,
        txt_Batch_Number,
        dte_Created_Date,
        txt_Created_By,
        dte_Modified_Date,
        txt_Modified_By,
        bit_IsActive
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      itemId,
      auditData.int_Order_Id,
      auditData.int_Product_Id,
      auditData.int_Unit_Id || null,
      qty,
      unitCost,
      unitPrice,
      auditData.dec_Discount_Percentage || 0,
      discountAmt,
      auditData.dec_Tax_Percentage || auditData.dec_Tax_Rate || 0,
      taxAmt,
      subtotal,
      lineTotal,
      auditData.txt_Batch_Number || null,
      auditData.dte_Created_Date,
      auditData.txt_Created_By,
      auditData.dte_Modified_Date,
      auditData.txt_Modified_By,
      auditData.bit_IsActive,
    ];

    await this.execute(sql, params, connection);
    return { ...auditData, int_Order_Item_Id: itemId, dec_Line_Total: lineTotal };
  }
}

module.exports = new OrderItemRepository();

