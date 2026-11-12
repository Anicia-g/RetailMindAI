require('./env');
const mysql = require('mysql2/promise');

const isSsl = process.env.MYSQL_SSL === 'true' || process.env.DB_SSL === 'true';

const poolConfig = {
  host: process.env.MYSQL_HOST || process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.MYSQL_PORT || process.env.DB_PORT || '3306', 10),
  user: process.env.MYSQL_USER || process.env.DB_USER || 'root',
  password: process.env.MYSQL_PASSWORD || process.env.DB_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || process.env.DB_NAME || 'retailmind_ai',
  waitForConnections: true,
  connectionLimit: 15,
  queueLimit: 0,
  decimalNumbers: true,
  dateStrings: false,
};

if (isSsl) {
  poolConfig.ssl = {
    rejectUnauthorized: false,
  };
}

const pool = mysql.createPool(poolConfig);

/**
 * Validates active connection on backend startup
 */
const connectDB = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('====================================================');
    console.log('✅ MySQL connected successfully via mysql2/promise');
    console.log(`📦 Database: ${process.env.MYSQL_DATABASE || 'retailmind_ai'}`);
    console.log(`🏠 Host: ${process.env.MYSQL_HOST || 'localhost'}:${process.env.MYSQL_PORT || '3306'}`);
    console.log('====================================================');
    connection.release();
  } catch (error) {
    console.error('❌ MySQL connection failed:', error.message);
    throw error;
  }
};

/**
 * Execute parameterized query using pool
 */
const query = async (sql, params = []) => {
  const [rows, fields] = await pool.query(sql, params);
  return rows;
};

/**
 * Execute parameterized statement using pool
 */
const execute = async (sql, params = []) => {
  const [result] = await pool.execute(sql, params);
  return result;
};

/**
 * Executes an operation inside an ACID database transaction.
 * Automatically manages beginTransaction, commit, rollback, and connection release.
 *
 * @param {Function} callback - Async function receiving (connection)
 * @returns {Promise<any>} Result of the callback
 */
const withTransaction = async (callback) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

module.exports = {
  pool,
  connectDB,
  query,
  execute,
  withTransaction,
};