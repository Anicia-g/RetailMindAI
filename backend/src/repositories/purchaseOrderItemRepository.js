const BaseRepository = require('./baseRepository');

class PurchaseOrderItemRepository extends BaseRepository {
  constructor() {
    super('tbl_Purchase_Order_Item', 'int_Purchase_Order_Item_Id');
  }

  toDTO(row) {
    if (!row) return null;
    return {
      _id: String(row.int_Purchase_Order_Item_Id),
      id: String(row.int_Purchase_Order_Item_Id),
      purchaseOrderItemId: row.int_Purchase_Order_Item_Id,
      purchaseOrderId: row.int_Purchase_Order_Id,
      productId: row.int_Product_Id,
      orderedQuantity: Number(row.int_Ordered_Quantity || row.int_Quantity_Ordered || 0),
      receivedQuantity: Number(row.int_Received_Quantity || 0),
      unitCost: Number(row.dec_Unit_Cost || 0),
      discountPercentage: Number(row.dec_Discount_Percentage || 0),
      taxPercentage: Number(row.dec_Tax_Percentage || 0),
      taxAmount: Number(row.dec_Tax_Amount || 0),
      subtotal: Number(row.dec_Subtotal_Amount || (row.int_Ordered_Quantity * row.dec_Unit_Cost) || 0),
      total: Number(row.dec_Total_Amount || row.dec_Line_Total || (row.int_Ordered_Quantity * row.dec_Unit_Cost) || 0),
      itemStatus: row.txt_Item_Status || 'Pending',
      bit_IsActive: this.toBoolean(row.bit_IsActive),
    };
  }

  async createPOItem(data, user = 'system', connection = null) {
    const poiId = data.int_Purchase_Order_Item_Id || await this.getNextId(connection);
    const auditData = this.withAuditInsert(data, user);
    const qty = auditData.int_Ordered_Quantity || auditData.int_Quantity_Ordered || 0;
    const unitCost = auditData.dec_Unit_Cost != null ? auditData.dec_Unit_Cost : 0;
    const subtotal = auditData.dec_Subtotal != null ? auditData.dec_Subtotal : (qty * unitCost);
    const lineTotal = auditData.dec_Line_Total != null ? auditData.dec_Line_Total : (auditData.dec_Total_Amount != null ? auditData.dec_Total_Amount : (auditData.total != null ? auditData.total : (subtotal)));

    const sql = `
      INSERT INTO tbl_Purchase_Order_Item (
        int_Purchase_Order_Item_Id,
        int_Purchase_Order_Id,
        int_Product_Id,
        int_Ordered_Quantity,
        int_Received_Quantity,
        dec_Unit_Cost,
        dec_Tax_Percentage,
        dec_Tax_Amount,
        dec_Subtotal,
        dec_Line_Total,
        txt_Item_Status,
        dte_Created_Date,
        txt_Created_By,
        dte_Modified_Date,
        txt_Modified_By,
        bit_IsActive
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      poiId,
      auditData.int_Purchase_Order_Id,
      auditData.int_Product_Id,
      qty,
      auditData.int_Received_Quantity || 0,
      unitCost,
      auditData.dec_Tax_Percentage || 0,
      auditData.dec_Tax_Amount || 0,
      subtotal,
      lineTotal,
      auditData.txt_Item_Status || 'Pending',
      auditData.dte_Created_Date,
      auditData.txt_Created_By,
      auditData.dte_Modified_Date,
      auditData.txt_Modified_By,
      auditData.bit_IsActive,
    ];

    await this.execute(sql, params, connection);
    return { ...auditData, int_Purchase_Order_Item_Id: poiId, dec_Line_Total: lineTotal };
  }
}

module.exports = new PurchaseOrderItemRepository();

