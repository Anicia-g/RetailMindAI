const BaseRepository = require('./baseRepository');

class OrderRepository extends BaseRepository {
  constructor() {
    super('tbl_Order', 'int_Order_Id');
  }

  toDTO(row, items = []) {
    if (!row) return null;
    const orderIdStr = `ord-${String(row.int_Order_Id).padStart(4, '0')}`;
    const custIdStr = row.int_Customer_Id ? `cust-${String(row.int_Customer_Id).padStart(3, '0')}` : 'cust-walkin';
    const storeIdStr = row.int_Store_Id ? `store-${String(row.int_Store_Id).padStart(2, '0')}` : 'store-01';
    const sellerIdStr = row.int_User_Id ? String(row.int_User_Id) : '1';

    const customerName = row.customer_name || (row.cust_first ? `${row.cust_first} ${row.cust_last || ''}`.trim() : 'Walk-in Shopper');
    const sellerName = row.seller_name || (row.user_first ? `${row.user_first} ${row.user_last || ''}`.trim() : 'Store Staff');
    const storeName = row.txt_Store_Name || 'Indiranagar Flagship (Store 01)';

    return {
      _id: String(row.int_Order_Id),
      id: String(row.int_Order_Id),
      orderId: orderIdStr,
      orderNumber: row.txt_Order_Number,
      customerId: custIdStr,
      customerName,
      sellerId: sellerIdStr,
      sellerName,
      storeId: storeIdStr,
      store: storeName,
      items: items.map((i) => ({
        id: String(i.int_Order_Item_Id || i.id),
        productId: `prod-${String(i.int_Product_Id).padStart(3, '0')}`,
        internalProductId: i.int_Product_Id,
        name: i.txt_Product_Name || i.name,
        sku: i.txt_SKU || i.sku,
        qty: Number(i.int_Quantity || i.qty || 1),
        quantity: Number(i.int_Quantity || i.qty || 1),
        price: Number(i.dec_Unit_Price || i.price || 0),
        originalPrice: Number(i.dec_Unit_Price || i.price || 0),
        discount: Number(i.dec_Discount_Amount || 0),
        total: Number(i.dec_Total_Amount || i.dec_Line_Total || (i.int_Quantity * i.dec_Unit_Price) || 0),
        image: i.txt_Product_Image_Url || i.txt_Image_URL || '',
      })),
      itemsCount: items.reduce((acc, i) => acc + Number(i.int_Quantity || i.qty || 1), 0),
      subtotal: Number(row.dec_Subtotal_Amount || 0),
      discount: Number(row.dec_Discount_Amount || 0),
      tax: Number(row.dec_Tax_Amount || 0),
      totalAmount: Number(row.dec_Total_Amount || 0),
      total: Number(row.dec_Total_Amount || 0),
      orderType: row.txt_Order_Type || 'POS_SALE',
      status: row.txt_Order_Status || 'Completed',
      paymentStatus: row.txt_Payment_Status || 'Paid',
      paymentMethod: row.payment_method_name || 'UPI',
      deliveryAddress: row.txt_Delivery_Address || 'Walk-in Store POS',
      date: row.dte_Order_Date ? String(row.dte_Order_Date).replace('T', ' ').slice(0, 16) : new Date().toISOString().slice(0, 16),
      createdAt: row.dte_Order_Date || row.dte_Created_Date,
      bit_IsActive: this.toBoolean(row.bit_IsActive),
    };
  }

  async findOrderById(identifier, connection = null) {
    const numericMatch = String(identifier).match(/\d+/);
    const numericId = numericMatch ? parseInt(numericMatch[0], 10) : (parseInt(identifier, 10) || null);

    const sql = `
      SELECT 
        o.*,
        s.txt_Store_Name,
        c.txt_First_Name AS cust_first,
        c.txt_Last_Name AS cust_last,
        u.txt_First_Name AS user_first,
        u.txt_Last_Name AS user_last,
        pm.txt_Payment_Method_Name AS payment_method_name
      FROM tbl_Order o
      LEFT JOIN tbl_Store s ON o.int_Store_Id = s.int_Store_Id
      LEFT JOIN tbl_Customer c ON o.int_Customer_Id = c.int_Customer_Id
      LEFT JOIN tbl_User u ON o.int_User_Id = u.int_User_Id
      LEFT JOIN tbl_Payment_Method pm ON o.int_Payment_Method_Id = pm.int_Payment_Method_Id
      WHERE (o.int_Order_Id = ? OR o.txt_Order_Number = ?)
        AND o.bit_IsActive = 1
      LIMIT 1
    `;

    const rows = await this.query(sql, [numericId || 0, identifier], connection);
    if (!rows[0]) return null;

    const items = await this.getOrderItems(rows[0].int_Order_Id, connection);
    return this.toDTO(rows[0], items);
  }

  async getAllOrders(limit = 100, connection = null) {
    const sql = `
      SELECT 
        o.*,
        s.txt_Store_Name,
        c.txt_First_Name AS cust_first,
        c.txt_Last_Name AS cust_last,
        u.txt_First_Name AS user_first,
        u.txt_Last_Name AS user_last,
        pm.txt_Payment_Method_Name AS payment_method_name
      FROM tbl_Order o
      LEFT JOIN tbl_Store s ON o.int_Store_Id = s.int_Store_Id
      LEFT JOIN tbl_Customer c ON o.int_Customer_Id = c.int_Customer_Id
      LEFT JOIN tbl_User u ON o.int_User_Id = u.int_User_Id
      LEFT JOIN tbl_Payment_Method pm ON o.int_Payment_Method_Id = pm.int_Payment_Method_Id
      WHERE o.bit_IsActive = 1
      ORDER BY o.dte_Order_Date DESC
      LIMIT ?
    `;
    const rows = await this.query(sql, [limit], connection);
    return rows.map((r) => this.toDTO(r));
  }

  async findAllOrders(filters = {}, connection = null) {
    let sql = `
      SELECT 
        o.*,
        s.txt_Store_Name,
        c.txt_First_Name AS cust_first,
        c.txt_Last_Name AS cust_last,
        u.txt_First_Name AS user_first,
        u.txt_Last_Name AS user_last,
        pm.txt_Payment_Method_Name AS payment_method_name
      FROM tbl_Order o
      LEFT JOIN tbl_Store s ON o.int_Store_Id = s.int_Store_Id
      LEFT JOIN tbl_Customer c ON o.int_Customer_Id = c.int_Customer_Id
      LEFT JOIN tbl_User u ON o.int_User_Id = u.int_User_Id
      LEFT JOIN tbl_Payment_Method pm ON o.int_Payment_Method_Id = pm.int_Payment_Method_Id
      WHERE o.bit_IsActive = 1
    `;
    const params = [];

    if (filters.search) {
      const q = `%${filters.search.trim()}%`;
      sql += ` AND (o.txt_Order_Number LIKE ? OR c.txt_First_Name LIKE ? OR s.txt_Store_Name LIKE ?)`;
      params.push(q, q, q);
    }

    if (filters.customerId) {
      const custNum = parseInt(String(filters.customerId).replace(/\D/g, ''), 10);
      if (!isNaN(custNum)) {
        sql += ` AND o.int_Customer_Id = ?`;
        params.push(custNum);
      }
    }

    if (filters.sellerId) {
      const sellerNum = parseInt(String(filters.sellerId).replace(/\D/g, ''), 10);
      if (!isNaN(sellerNum)) {
        sql += ` AND o.int_User_Id = ?`;
        params.push(sellerNum);
      }
    }

    if (filters.storeId && filters.storeId !== 'All') {
      const storeNum = parseInt(String(filters.storeId).replace(/\D/g, ''), 10);
      if (!isNaN(storeNum)) {
        sql += ` AND o.int_Store_Id = ?`;
        params.push(storeNum);
      }
    }

    if (filters.status && filters.status !== 'All') {
      sql += ` AND o.txt_Order_Status = ?`;
      params.push(filters.status);
    }

    sql += ` ORDER BY o.dte_Order_Date DESC`;

    const limit = parseInt(filters.limit, 10) || 50;
    const offset = ((parseInt(filters.page, 10) || 1) - 1) * limit;
    sql += ` LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const rows = await this.query(sql, params, connection);
    if (rows.length === 0) return [];

    const orderIds = rows.map((r) => r.int_Order_Id);
    const itemSql = `
      SELECT 
        oi.*,
        p.txt_Product_Name,
        p.txt_SKU,
        p.txt_Product_Image_Url,
        p.txt_Image_URL
      FROM tbl_Order_Item oi
      JOIN tbl_Product p ON oi.int_Product_Id = p.int_Product_Id
      WHERE oi.int_Order_Id IN (${orderIds.map(() => '?').join(',')}) AND oi.bit_IsActive = 1
    `;
    const allItems = await this.query(itemSql, orderIds, connection);
    const itemsByOrderId = {};
    allItems.forEach((i) => {
      if (!itemsByOrderId[i.int_Order_Id]) itemsByOrderId[i.int_Order_Id] = [];
      itemsByOrderId[i.int_Order_Id].push(i);
    });

    return rows.map((r) => this.toDTO(r, itemsByOrderId[r.int_Order_Id] || []));
  }

  async countOrders(filters = {}, connection = null) {
    let sql = `SELECT COUNT(*) AS total FROM tbl_Order o WHERE o.bit_IsActive = 1`;
    const params = [];
    if (filters.status && filters.status !== 'All') {
      sql += ` AND o.txt_Order_Status = ?`;
      params.push(filters.status);
    }
    const rows = await this.query(sql, params, connection);
    return rows[0]?.total || 0;
  }

  async getOrderItems(orderId, connection = null) {
    const sql = `
      SELECT 
        oi.*,
        p.txt_Product_Name,
        p.txt_SKU,
        p.txt_Product_Image_Url,
        p.txt_Image_URL
      FROM tbl_Order_Item oi
      JOIN tbl_Product p ON oi.int_Product_Id = p.int_Product_Id
      WHERE oi.int_Order_Id = ? AND oi.bit_IsActive = 1
    `;
    return await this.query(sql, [orderId], connection);
  }

  async getRecentOrders(limit = 10, connection = null) {
    const sql = `
      SELECT 
        o.*,
        s.txt_Store_Name,
        c.txt_First_Name AS cust_first,
        c.txt_Last_Name AS cust_last,
        u.txt_First_Name AS user_first,
        u.txt_Last_Name AS user_last,
        pm.txt_Payment_Method_Name AS payment_method_name
      FROM tbl_Order o
      LEFT JOIN tbl_Store s ON o.int_Store_Id = s.int_Store_Id
      LEFT JOIN tbl_Customer c ON o.int_Customer_Id = c.int_Customer_Id
      LEFT JOIN tbl_User u ON o.int_User_Id = u.int_User_Id
      LEFT JOIN tbl_Payment_Method pm ON o.int_Payment_Method_Id = pm.int_Payment_Method_Id
      WHERE o.bit_IsActive = 1
      ORDER BY o.dte_Order_Date DESC
      LIMIT ?
    `;
    const rows = await this.query(sql, [limit], connection);
    return rows.map((r) => this.toDTO(r));
  }

  async createOrder(orderData, user = 'system', connection = null) {
    const orderId = orderData.int_Order_Id || await this.getNextId(connection);
    const auditData = this.withAuditInsert(orderData, user);
    const sql = `
      INSERT INTO tbl_Order (
        int_Order_Id,
        txt_Order_Number,
        int_Store_Id,
        int_Customer_Id,
        int_User_Id,
        dte_Order_Date,
        txt_Order_Type,
        txt_Order_Status,
        dec_Subtotal_Amount,
        dec_Discount_Amount,
        dec_Tax_Amount,
        dec_Shipping_Amount,
        dec_Total_Amount,
        dec_Paid_Amount,
        dec_Due_Amount,
        int_Payment_Method_Id,
        txt_Payment_Status,
        txt_Delivery_Address,
        dte_Delivery_Date,
        txt_Order_Notes,
        txt_Sales_Channel,
        dte_Created_Date,
        txt_Created_By,
        dte_Modified_Date,
        txt_Modified_By,
        bit_IsActive
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      orderId,
      auditData.txt_Order_Number,
      auditData.int_Store_Id || 1,
      auditData.int_Customer_Id || null,
      auditData.int_User_Id || 1,
      auditData.dte_Order_Date ? this.formatDateTime(auditData.dte_Order_Date) : this.formatDateTime(new Date()),
      auditData.txt_Order_Type || 'POS_SALE',
      auditData.txt_Order_Status || 'Completed',
      auditData.dec_Subtotal_Amount || 0,
      auditData.dec_Discount_Amount || 0,
      auditData.dec_Tax_Amount || 0,
      auditData.dec_Shipping_Amount || 0,
      auditData.dec_Total_Amount || 0,
      auditData.dec_Paid_Amount || auditData.dec_Total_Amount || 0,
      auditData.dec_Due_Amount || 0,
      auditData.int_Payment_Method_Id || 1,
      auditData.txt_Payment_Status || 'Paid',
      auditData.txt_Delivery_Address || 'In-Store POS',
      auditData.dte_Delivery_Date ? this.formatDateTime(auditData.dte_Delivery_Date) : null,
      auditData.txt_Order_Notes || null,
      auditData.txt_Sales_Channel || 'POS',
      auditData.dte_Created_Date,
      auditData.txt_Created_By,
      auditData.dte_Modified_Date,
      auditData.txt_Modified_By,
      auditData.bit_IsActive,
    ];

    await this.execute(sql, params, connection);
    return { ...auditData, int_Order_Id: orderId };
  }

  async updateOrderStatus(id, status, user = 'system', connection = null) {
    const now = this.formatDateTime(new Date());
    const sql = `
      UPDATE tbl_Order
      SET txt_Order_Status = ?,
          dte_Modified_Date = ?,
          txt_Modified_By = ?
      WHERE int_Order_Id = ? OR txt_Order_Number = ?
    `;
    await this.execute(sql, [status, now, user, id, id], connection);
    return await this.findOrderById(id, connection);
  }
}

module.exports = new OrderRepository();
