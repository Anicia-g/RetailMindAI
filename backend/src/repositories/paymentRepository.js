const BaseRepository = require('./baseRepository');

class PaymentRepository extends BaseRepository {
  constructor() {
    super('tbl_Payment', 'int_Payment_Id');
  }

  toDTO(row) {
    if (!row) return null;
    const payIdStr = `PAY-${String(row.int_Payment_Id).padStart(4, '0')}`;
    const orderIdStr = `ord-${String(row.int_Source_Id).padStart(4, '0')}`;
    return {
      _id: String(row.int_Payment_Id),
      id: String(row.int_Payment_Id),
      paymentId: payIdStr,
      orderId: orderIdStr,
      internalOrderId: row.int_Source_Id,
      customerId: row.int_Customer_Id ? `cust-${String(row.int_Customer_Id).padStart(3, '0')}` : 'cust-walkin',
      customerName: row.customer_name || 'Walk-in Shopper',
      method: row.payment_method_name || 'UPI',
      amount: Number(row.dec_Amount || 0),
      status: row.txt_Payment_Status || 'Completed',
      gateway: row.txt_Gateway_Response_Code || 'POS Terminal / Razorpay',
      transactionRef: row.txt_Transaction_Reference_Number,
      paidAt: row.dte_Payment_Date || row.dte_Created_Date,
      bit_IsActive: this.toBoolean(row.bit_IsActive),
    };
  }

  async createPayment({
    orderId,
    paymentMethodId = 1,
    amount,
    status = 'Completed',
    gateway = 'In-Store POS Terminal',
    transactionRef = null,
    receivedByUserId = 1,
    storeId = 1,
    user = 'system',
  }, connection = null) {
    const payId = await this.getNextId(connection);
    const payRef = `PAY-REF-${Date.now().toString().slice(-6)}`;
    const auditData = this.withAuditInsert(
      {
        int_Payment_Id: payId,
        txt_Payment_Reference_Number: payRef,
        txt_Payment_Source_Type: 'ORDER',
        int_Source_Id: orderId,
        int_Payment_Method_Id: paymentMethodId || 1,
        dec_Amount: amount,
        dte_Payment_Date: this.formatDateTime(new Date()),
        txt_Payment_Status: status,
        txt_Transaction_Reference_Number: transactionRef || `TXN-${payId}`,
        int_Received_By_User_Id: receivedByUserId || 1,
        txt_Gateway_Response_Code: gateway,
        int_Store_Id: storeId || 1,
        bit_Is_Refund: 0,
      },
      user
    );

    const sql = `
      INSERT INTO tbl_Payment (
        int_Payment_Id,
        txt_Payment_Reference_Number,
        txt_Payment_Source_Type,
        int_Source_Id,
        int_Payment_Method_Id,
        dec_Amount,
        dte_Payment_Date,
        txt_Payment_Status,
        txt_Transaction_Reference_Number,
        int_Received_By_User_Id,
        txt_Gateway_Response_Code,
        int_Store_Id,
        bit_Is_Refund,
        dte_Created_Date,
        txt_Created_By,
        dte_Modified_Date,
        txt_Modified_By,
        bit_IsActive
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      payId,
      auditData.txt_Payment_Reference_Number,
      auditData.txt_Payment_Source_Type,
      auditData.int_Source_Id,
      auditData.int_Payment_Method_Id,
      auditData.dec_Amount,
      auditData.dte_Payment_Date,
      auditData.txt_Payment_Status,
      auditData.txt_Transaction_Reference_Number,
      auditData.int_Received_By_User_Id,
      auditData.txt_Gateway_Response_Code,
      auditData.int_Store_Id,
      auditData.bit_Is_Refund,
      auditData.dte_Created_Date,
      auditData.txt_Created_By,
      auditData.dte_Modified_Date,
      auditData.txt_Modified_By,
      auditData.bit_IsActive,
    ];

    await this.execute(sql, params, connection);
    return { ...auditData, int_Payment_Id: payId };
  }

  async findAllPayments(filters = {}, connection = null) {
    let sql = `
      SELECT 
        p.*,
        pm.txt_Payment_Method_Name AS payment_method_name,
        o.int_Customer_Id,
        CONCAT(c.txt_First_Name, ' ', COALESCE(c.txt_Last_Name, '')) AS customer_name
      FROM tbl_Payment p
      LEFT JOIN tbl_Payment_Method pm ON p.int_Payment_Method_Id = pm.int_Payment_Method_Id
      LEFT JOIN tbl_Order o ON p.int_Source_Id = o.int_Order_Id
      LEFT JOIN tbl_Customer c ON o.int_Customer_Id = c.int_Customer_Id
      WHERE p.bit_IsActive = 1
      ORDER BY p.dte_Payment_Date DESC
    `;
    const rows = await this.query(sql, [], connection);
    return rows.map((r) => this.toDTO(r));
  }
}

module.exports = new PaymentRepository();
