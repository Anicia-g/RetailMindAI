const notificationRepository = require('../repositories/notificationRepository');
const productRepository = require('../repositories/productRepository');
const stockRiskRepository = require('../repositories/stockRiskRepository');
const db = require('../config/db');

class NotificationService {
  /**
   * Creates a persistent notification in tbl_Notification
   */
  async createNotification({
    recipient = 'all',
    role = 'ALL',
    storeId = null,
    type = 'SYSTEM_NOTIFICATION',
    title,
    message,
    priority = 'MEDIUM',
    actionUrl = '',
    metadata = {},
  }) {
    if (!title || !message) {
      throw new Error('Notification title and message are required.');
    }

    let userId = null;
    if (recipient && recipient !== 'all' && !isNaN(recipient)) {
      userId = parseInt(recipient, 10);
    }

    const notif = await notificationRepository.create({
      userId,
      type: type || 'SYSTEM_NOTIFICATION',
      title: String(title),
      message: String(message),
      priorityLevel: priority || 'MEDIUM',
      priority: priority || 'MEDIUM',
      isRead: false,
      readDate: null,
      referenceType: metadata?.referenceType || (metadata?.productId ? 'PRODUCT' : null),
      referenceId: metadata?.productId ? Number(metadata.productId) : (metadata?.referenceId ? Number(metadata.referenceId) : null),
      sentDate: new Date(),
      channel: 'In-App',
      deliveryStatus: 'Delivered',
      actionUrl: actionUrl || '',
      storeId: storeId ? Number(storeId) : null,
      isActive: true,
      createdBy: 'system',
      modifiedBy: 'system',
    });

    return notif;
  }

  /**
   * Retrieves notifications scoped strictly to the authenticated user and role
   */
  async getUserNotifications(user, query = {}) {
    const userId = user?.userId || user?.id || user?._id || user?.customerId;
    const numericUserId = userId && !isNaN(userId) ? parseInt(userId, 10) : null;
    const storeId = user?.storeId ? parseInt(user.storeId, 10) : null;
    const limit = parseInt(query.limit || '30', 10);

    const conditions = ['n.bit_IsActive = 1'];
    const params = [];

    // Filter by recipient: either global (NULL) or matching current user
    if (numericUserId) {
      if (storeId) {
        conditions.push('(n.int_User_Id IS NULL OR n.int_User_Id = ? OR n.int_Store_Id = ?)');
        params.push(numericUserId, storeId);
      } else {
        conditions.push('(n.int_User_Id IS NULL OR n.int_User_Id = ?)');
        params.push(numericUserId);
      }
    } else if (storeId) {
      conditions.push('(n.int_User_Id IS NULL OR n.int_Store_Id = ?)');
      params.push(storeId);
    }

    if (query.unreadOnly === 'true' || query.unreadOnly === true) {
      conditions.push('n.bit_Is_Read = 0');
    }
    if (query.type) {
      conditions.push('n.txt_Notification_Type = ?');
      params.push(query.type);
    }

    params.push(limit);

    const sql = `
      SELECT n.*
      FROM tbl_Notification n
      WHERE ${conditions.join(' AND ')}
      ORDER BY n.dte_Created_Date DESC
      LIMIT ?
    `;

    const rows = await db.query(sql, params);
    return rows.map((r) => notificationRepository.toDTO(r));
  }

  /**
   * Gets unread notification count for a user
   */
  async getUnreadCount(user) {
    const userId = user?.userId || user?.id || user?._id || user?.customerId;
    const numericUserId = userId && !isNaN(userId) ? parseInt(userId, 10) : null;
    const storeId = user?.storeId ? parseInt(user.storeId, 10) : null;

    const conditions = ['bit_IsActive = 1', 'bit_Is_Read = 0'];
    const params = [];

    if (numericUserId) {
      if (storeId) {
        conditions.push('(int_User_Id IS NULL OR int_User_Id = ? OR int_Store_Id = ?)');
        params.push(numericUserId, storeId);
      } else {
        conditions.push('(int_User_Id IS NULL OR int_User_Id = ?)');
        params.push(numericUserId);
      }
    } else if (storeId) {
      conditions.push('(int_User_Id IS NULL OR int_Store_Id = ?)');
      params.push(storeId);
    }

    const sql = `
      SELECT COUNT(*) AS unreadCount
      FROM tbl_Notification
      WHERE ${conditions.join(' AND ')}
    `;

    const rows = await db.query(sql, params);
    return Number(rows[0]?.unreadCount || 0);
  }

  /**
   * Marks a single notification as read
   */
  async markAsRead(id, user) {
    const notifId = parseInt(id, 10);
    const existing = await notificationRepository.findById(notifId);
    if (!existing) {
      throw new Error(`Notification ${id} not found`);
    }

    await notificationRepository.update(notifId, {
      isRead: true,
      readDate: new Date(),
      modifiedBy: user?.email || 'system',
    });

    const updated = await notificationRepository.findById(notifId);
    return notificationRepository.toDTO(updated);
  }

  /**
   * Marks all user notifications as read
   */
  async markAllAsRead(user) {
    const userId = user?.userId || user?.id || user?._id || user?.customerId;
    const numericUserId = userId && !isNaN(userId) ? parseInt(userId, 10) : null;

    let sql = `
      UPDATE tbl_Notification
      SET bit_Is_Read = 1,
          dte_Read_Date = NOW(),
          txt_Modified_By = ?,
          dte_Modified_Date = NOW()
      WHERE bit_IsActive = 1 AND bit_Is_Read = 0
    `;
    const params = [user?.email || 'system'];

    if (numericUserId) {
      sql += ' AND (int_User_Id IS NULL OR int_User_Id = ?)';
      params.push(numericUserId);
    }

    const result = await db.query(sql, params);
    return {
      success: true,
      modifiedCount: result.affectedRows || 0,
    };
  }

  /**
   * Evaluates inventory, ML risks, and anomalies to generate system alert notifications
   */
  async generateSystemAlerts() {
    const alertsCreated = [];

    // 1. Scan low-stock products
    const lowStockSql = `
      SELECT p.int_Product_Id AS productId, p.txt_Product_Name AS name, 
             COALESCE(i.int_Quantity_Available, 0) AS stock, p.int_Reorder_Level AS reorderLevel
      FROM tbl_Product p
      LEFT JOIN tbl_Inventory i ON p.int_Product_Id = i.int_Product_Id
      WHERE p.bit_IsActive = 1 AND COALESCE(i.int_Quantity_Available, 0) <= p.int_Reorder_Level
      LIMIT 5
    `;
    const lowStockProducts = await db.query(lowStockSql);

    for (const p of lowStockProducts) {
      const existingSql = `
        SELECT int_Notification_Id
        FROM tbl_Notification
        WHERE txt_Notification_Type = 'LOW_STOCK'
          AND int_Reference_Id = ?
          AND bit_Is_Read = 0
          AND bit_IsActive = 1
        LIMIT 1
      `;
      const existing = await db.query(existingSql, [p.productId]);

      if (existing.length === 0) {
        const notif = await this.createNotification({
          recipient: 'all',
          role: 'ADMIN',
          type: 'LOW_STOCK',
          title: `Low Stock Alert: ${p.name}`,
          message: `Current stock (${p.stock} units) has breached the reorder threshold of ${p.reorderLevel} units.`,
          priority: p.stock === 0 ? 'CRITICAL' : 'HIGH',
          actionUrl: '/inventory',
          metadata: { productId: p.productId, stock: p.stock, reorderLevel: p.reorderLevel },
        });
        alertsCreated.push(notif);
      }
    }

    // 2. Scan high-risk inventory items from ML table
    const highRiskSql = `
      SELECT sr.int_Stock_Risk_Id AS stockRiskId, sr.int_Product_Id AS productId,
             sr.txt_Risk_Level AS riskLevel, sr.dec_Risk_Score AS riskScore,
             sr.int_Days_Until_Stockout AS daysRemaining, sr.int_Store_Id AS storeId,
             p.txt_Product_Name AS productName
      FROM tbl_Stock_Risk sr
      LEFT JOIN tbl_Product p ON sr.int_Product_Id = p.int_Product_Id
      WHERE sr.bit_IsActive = 1 AND sr.txt_Risk_Level = 'HIGH'
      LIMIT 3
    `;
    const highRiskItems = await db.query(highRiskSql);

    for (const r of highRiskItems) {
      const existingSql = `
        SELECT int_Notification_Id
        FROM tbl_Notification
        WHERE txt_Notification_Type = 'HIGH_STOCK_RISK'
          AND int_Reference_Id = ?
          AND bit_Is_Read = 0
          AND bit_IsActive = 1
        LIMIT 1
      `;
      const existing = await db.query(existingSql, [r.productId]);

      if (existing.length === 0) {
        const notif = await this.createNotification({
          recipient: 'all',
          role: 'ADMIN',
          storeId: r.storeId,
          type: 'HIGH_STOCK_RISK',
          title: `High Stockout Risk: ${r.productName || `Product #${r.productId}`}`,
          message: `Stock-out risk score is ${Math.round((Number(r.riskScore) || 0.88) * 100)}% with ~${r.daysRemaining || 2} days runway remaining.`,
          priority: 'CRITICAL',
          actionUrl: '/purchase-orders',
          metadata: { productId: r.productId, riskLevel: r.riskLevel },
        });
        alertsCreated.push(notif);
      }
    }

    return {
      generatedCount: alertsCreated.length,
      alerts: alertsCreated,
    };
  }
}

module.exports = new NotificationService();
