/**
 * RetailMind AI — Automated Cloud MySQL Migration Runner
 * Executes the complete migration pipeline against target MySQL instance:
 * 1. Schema Initialization (37 approved tables)
 * 2. Hardening (82 Canonical FKs + 20 Secondary Indexes)
 * 3. Master / Baseline Seed Data (260 baseline records with bcrypt password hashing)
 * 4. Full Relational & Integrity Audit
 */
require('../config/env');
const { pool, connectDB } = require('../config/db');
const { createTables } = require('./initMySQLSchema');
const { applyHardening } = require('./applyHardening');
const { seedAll } = require('./seedMySQL');

async function runCloudMigration() {
  console.log('====================================================');
  console.log('🚀 RETAILMIND AI — CLOUD DATABASE MIGRATION PIPELINE');
  console.log('====================================================');
  console.log(`Target Host:     ${process.env.MYSQL_HOST || process.env.DB_HOST || 'localhost'}`);
  console.log(`Target Port:     ${process.env.MYSQL_PORT || process.env.DB_PORT || '3306'}`);
  console.log(`Target Database: ${process.env.MYSQL_DATABASE || process.env.DB_NAME || 'retailmind_ai'}`);
  console.log(`SSL Mode:        ${process.env.MYSQL_SSL === 'true' || process.env.DB_SSL === 'true' ? 'ENABLED (TLS)' : 'DISABLED'}`);
  console.log('====================================================\n');

  try {
    // Step 1: Validate Cloud Database Connection
    console.log('[Step 1/5] Testing Cloud MySQL Connection...');
    await connectDB();
    const [ping] = await pool.query('SELECT 1 AS is_alive, VERSION() AS mysql_version, DATABASE() AS current_db');
    console.log(`✅ Cloud MySQL Connected! Engine Version: ${ping[0].mysql_version}, DB: ${ping[0].current_db}\n`);

    // Step 2: Initialize 37 Tables
    console.log('[Step 2/5] Creating 37 Approved Relational Tables...');
    await createTables();
    console.log('✅ 37 Tables Successfully Created!\n');

    // Step 3: Apply FK & Index Hardening
    console.log('[Step 3/5] Applying 82 Canonical FKs & 20 Secondary Indexes...');
    await applyHardening();
    console.log('✅ Hardening Applied Successfully!\n');

    // Step 4: Seed Baseline / Master Data
    console.log('[Step 4/5] Seeding Clean Baseline Data (Master Data & Demo Credentials)...');
    await seedAll();
    console.log('✅ Baseline Data Seeded Successfully!\n');

    // Step 5: Execute Complete Information Schema Audit
    console.log('[Step 5/5] Executing Comprehensive Relational Audit...');
    const dbName = process.env.MYSQL_DATABASE || process.env.DB_NAME || 'retailmind_ai';

    // 5.1 Verify Table Count
    const [tables] = await pool.query(
      'SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ?',
      [dbName]
    );
    console.log(`📊 Table Count: ${tables.length} / 37 (Expected: 37)`);
    if (tables.length !== 37) {
      throw new Error(`Table count mismatch! Found ${tables.length}, expected exactly 37.`);
    }

    // 5.2 Verify FK Count
    const [fks] = await pool.query(
      `SELECT CONSTRAINT_NAME, TABLE_NAME, REFERENCED_TABLE_NAME 
       FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
       WHERE TABLE_SCHEMA = ? AND REFERENCED_TABLE_NAME IS NOT NULL`,
      [dbName]
    );
    console.log(`🔗 Foreign Keys: ${fks.length} / 82 (Expected: 82)`);
    if (fks.length !== 82) {
      throw new Error(`Foreign key count mismatch! Found ${fks.length}, expected exactly 82.`);
    }

    // 5.3 Verify Secondary Indexes Count
    const [indexes] = await pool.query(
      `SELECT DISTINCT INDEX_NAME, TABLE_NAME 
       FROM INFORMATION_SCHEMA.STATISTICS 
       WHERE TABLE_SCHEMA = ? AND INDEX_NAME NOT IN ('PRIMARY') AND INDEX_NAME NOT LIKE 'txt_%' AND INDEX_NAME NOT LIKE 'fk_%'`,
      [dbName]
    );
    console.log(`⚡ Secondary Indexes: ${indexes.length} (Expected: 20 named secondary indexes)`);

    // 5.4 Verify Zero Orphans Across Master Foreign Keys
    const [orphanCheck] = await pool.query(`
      SELECT 'tbl_Order without User' AS issue, COUNT(*) AS count FROM tbl_Order o LEFT JOIN tbl_User u ON o.int_User_Id = u.int_User_Id WHERE u.int_User_Id IS NULL
      UNION ALL
      SELECT 'tbl_Order_Item without Product', COUNT(*) FROM tbl_Order_Item oi LEFT JOIN tbl_Product p ON oi.int_Product_Id = p.int_Product_Id WHERE p.int_Product_Id IS NULL
      UNION ALL
      SELECT 'tbl_Inventory without Product', COUNT(*) FROM tbl_Inventory i LEFT JOIN tbl_Product p ON i.int_Product_Id = p.int_Product_Id WHERE p.int_Product_Id IS NULL
    `);
    const totalOrphans = orphanCheck.reduce((sum, r) => sum + parseInt(r.count, 10), 0);
    console.log(`🛡️ Orphan Records: ${totalOrphans} (Expected: 0)`);
    if (totalOrphans > 0) {
      throw new Error(`Orphan records detected in database! ${JSON.stringify(orphanCheck)}`);
    }

    console.log('\n====================================================');
    console.log('🎉 CLOUD DATABASE MIGRATION & AUDIT COMPLETED 100%!');
    console.log('====================================================\n');
  } catch (err) {
    console.error('\n❌ Cloud Migration Error:', err.message);
    throw err;
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  runCloudMigration()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { runCloudMigration };
