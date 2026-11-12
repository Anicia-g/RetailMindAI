const { pool, query, execute, withTransaction } = require('../config/db');

class BaseRepository {
  constructor(tableName, primaryKeyField) {
    this.tableName = tableName;
    this.primaryKeyField = primaryKeyField;
    this.pool = pool;
  }

  /**
   * Generates next sequential integer primary key
   */
  async getNextId(connection = null) {
    const sql = `SELECT COALESCE(MAX(${this.primaryKeyField}), 0) + 1 AS nextId FROM ${this.tableName}`;
    const rows = await this.query(sql, [], connection);
    return Number(rows[0]?.nextId || 1);
  }

  /**
   * Safe query helper supporting transaction connections or pool
   */
  async query(sql, params = [], connection = null) {
    if (connection && typeof connection.query === 'function') {
      const [rows] = await connection.query(sql, params);
      return rows;
    }
    return await query(sql, params);
  }

  /**
   * Safe execute helper supporting transaction connections or pool
   */
  async execute(sql, params = [], connection = null) {
    if (connection && typeof connection.execute === 'function') {
      const [result] = await connection.execute(sql, params);
      return result;
    }
    return await execute(sql, params);
  }

  /**
   * Formats Date to MySQL DATETIME string: YYYY-MM-DD HH:MM:SS
   */
  formatDateTime(date = new Date()) {
    const d = new Date(date);
    if (isNaN(d.getTime())) return null;
    return d.toISOString().slice(0, 19).replace('T', ' ');
  }

  /**
   * Formats Date to MySQL DATE string: YYYY-MM-DD
   */
  formatDate(date = new Date()) {
    const d = new Date(date);
    if (isNaN(d.getTime())) return null;
    return d.toISOString().slice(0, 10);
  }

  /**
   * Standardizes Bit(1) columns into Boolean
   */
  toBoolean(val) {
    if (val === null || val === undefined) return false;
    if (Buffer.isBuffer(val)) return val[0] === 1;
    return val === 1 || val === true || val === '1';
  }

  /**
   * Attaches standard audit fields for INSERT
   */
  withAuditInsert(data, user = 'system') {
    const now = this.formatDateTime(new Date());
    const username = typeof user === 'string' ? user : user?.name || user?.email || user?.username || 'system';
    return {
      ...data,
      dte_Created_Date: now,
      txt_Created_By: username,
      dte_Modified_Date: now,
      txt_Modified_By: username,
      bit_IsActive: data.bit_IsActive !== undefined ? (this.toBoolean(data.bit_IsActive) ? 1 : 0) : 1,
    };
  }

  /**
   * Attaches standard audit fields for UPDATE
   */
  withAuditUpdate(data, user = 'system') {
    const now = this.formatDateTime(new Date());
    const username = typeof user === 'string' ? user : user?.name || user?.email || user?.username || 'system';
    return {
      ...data,
      dte_Modified_Date: now,
      txt_Modified_By: username,
    };
  }

  /**
   * Generic find by primary key
   */
  async findById(id, connection = null) {
    const sql = `SELECT * FROM ${this.tableName} WHERE ${this.primaryKeyField} = ? AND bit_IsActive = 1 LIMIT 1`;
    const rows = await this.query(sql, [id], connection);
    return rows[0] || null;
  }

  /**
   * Generic find all active records
   */
  async findAll(connection = null) {
    const sql = `SELECT * FROM ${this.tableName} WHERE bit_IsActive = 1`;
    return await this.query(sql, [], connection);
  }

  /**
   * Generic getAll returning DTOs
   */
  async getAll(connection = null) {
    const rows = await this.findAll(connection);
    return this.toDTO ? rows.map((r) => this.toDTO(r)) : rows;
  }

  /**
   * Generic count
   */
  async count(conditions = {}, connection = null) {
    const sql = `SELECT COUNT(*) AS total FROM ${this.tableName} WHERE bit_IsActive = 1`;
    const rows = await this.query(sql, [], connection);
    return Number(rows[0]?.total || 0);
  }

  /**
   * Generic insert/create
   */
  async create(data, user = 'system', connection = null) {
    const entity = this.toEntity ? this.toEntity(data) : { ...data };
    if (!entity[this.primaryKeyField]) {
      entity[this.primaryKeyField] = await this.getNextId(connection);
    }
    const auditData = this.withAuditInsert(entity, user);
    const keys = Object.keys(auditData);
    const placeholders = keys.map(() => '?').join(', ');
    const values = Object.values(auditData);
    const sql = `INSERT INTO ${this.tableName} (\`${keys.join('`, `')}\`) VALUES (${placeholders})`;
    await this.execute(sql, values, connection);
    return this.toDTO ? this.toDTO(auditData) : auditData;
  }

  /**
   * Generic update
   */
  async update(id, data, user = 'system', connection = null) {
    const entity = this.toEntity ? this.toEntity(data) : { ...data };
    delete entity[this.primaryKeyField];
    const auditData = this.withAuditUpdate(entity, user);
    const keys = Object.keys(auditData);
    if (keys.length === 0) {
      const existing = await this.findById(id, connection);
      return this.toDTO ? this.toDTO(existing) : existing;
    }
    const setClauses = keys.map((k) => `\`${k}\` = ?`).join(', ');
    const values = [...Object.values(auditData), id];
    const sql = `UPDATE ${this.tableName} SET ${setClauses} WHERE ${this.primaryKeyField} = ?`;
    await this.execute(sql, values, connection);
    const updated = await this.findById(id, connection);
    return this.toDTO ? this.toDTO(updated) : updated;
  }

  /**
   * Generic soft delete
   */
  async softDelete(id, user = 'system', connection = null) {
    const now = this.formatDateTime(new Date());
    const username = typeof user === 'string' ? user : user?.name || user?.email || 'system';
    const sql = `
      UPDATE ${this.tableName}
      SET bit_IsActive = 0,
          dte_Modified_Date = ?,
          txt_Modified_By = ?
      WHERE ${this.primaryKeyField} = ?
    `;
    const result = await this.execute(sql, [now, username, id], connection);
    return result.affectedRows > 0;
  }
}

module.exports = BaseRepository;
