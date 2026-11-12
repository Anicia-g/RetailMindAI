/**
 * RetailMind AI — Database Hardening Applier
 * Applies Foreign Key Constraints and Secondary Indexes idempotently.
 */
require('../config/env');
const db = require('../config/db');

const fkDefinitions = [
  // 1. Master / Security
  { table: 'tbl_User', constraint: 'fk_user_role', col: 'int_Role_Id', parentTable: 'tbl_Role', parentCol: 'int_Role_Id', deleteRule: 'RESTRICT', updateRule: 'RESTRICT' },
  { table: 'tbl_User', constraint: 'fk_user_store', col: 'int_Store_Id', parentTable: 'tbl_Store', parentCol: 'int_Store_Id', deleteRule: 'SET NULL', updateRule: 'RESTRICT' },
  { table: 'tbl_User', constraint: 'fk_user_warehouse', col: 'int_Warehouse_Id', parentTable: 'tbl_Warehouse', parentCol: 'int_Warehouse_Id', deleteRule: 'SET NULL', updateRule: 'RESTRICT' },
  { table: 'tbl_Store', constraint: 'fk_store_manager', col: 'int_Manager_User_Id', parentTable: 'tbl_User', parentCol: 'int_User_Id', deleteRule: 'SET NULL', updateRule: 'RESTRICT' },
  { table: 'tbl_Warehouse', constraint: 'fk_warehouse_store', col: 'int_Store_Id', parentTable: 'tbl_Store', parentCol: 'int_Store_Id', deleteRule: 'SET NULL', updateRule: 'RESTRICT' },
  { table: 'tbl_Warehouse', constraint: 'fk_warehouse_manager', col: 'int_Manager_User_Id', parentTable: 'tbl_User', parentCol: 'int_User_Id', deleteRule: 'SET NULL', updateRule: 'RESTRICT' },
  { table: 'tbl_Category', constraint: 'fk_category_parent', col: 'int_Parent_Category_Id', parentTable: 'tbl_Category', parentCol: 'int_Category_Id', deleteRule: 'SET NULL', updateRule: 'RESTRICT' },

  // 2. Customer
  { table: 'tbl_Customer', constraint: 'fk_customer_store', col: 'int_Store_Id', parentTable: 'tbl_Store', parentCol: 'int_Store_Id', deleteRule: 'SET NULL', updateRule: 'RESTRICT' },
  { table: 'tbl_Customer', constraint: 'fk_customer_pref_store', col: 'int_Preferred_Store_Id', parentTable: 'tbl_Store', parentCol: 'int_Store_Id', deleteRule: 'SET NULL', updateRule: 'RESTRICT' },

  // 3. Product Master
  { table: 'tbl_Product', constraint: 'fk_product_category', col: 'int_Category_Id', parentTable: 'tbl_Category', parentCol: 'int_Category_Id', deleteRule: 'RESTRICT', updateRule: 'RESTRICT' },
  { table: 'tbl_Product', constraint: 'fk_product_brand', col: 'int_Brand_Id', parentTable: 'tbl_Brand', parentCol: 'int_Brand_Id', deleteRule: 'RESTRICT', updateRule: 'RESTRICT' },
  { table: 'tbl_Product', constraint: 'fk_product_unit', col: 'int_Unit_Id', parentTable: 'tbl_Unit', parentCol: 'int_Unit_Id', deleteRule: 'RESTRICT', updateRule: 'RESTRICT' },
  { table: 'tbl_Product', constraint: 'fk_product_tax', col: 'int_Tax_Id', parentTable: 'tbl_Tax', parentCol: 'int_Tax_Id', deleteRule: 'RESTRICT', updateRule: 'RESTRICT' },

  // 4. Inventory & Stock Ledger
  { table: 'tbl_Inventory', constraint: 'fk_inventory_product', col: 'int_Product_Id', parentTable: 'tbl_Product', parentCol: 'int_Product_Id', deleteRule: 'RESTRICT', updateRule: 'RESTRICT' },
  { table: 'tbl_Inventory', constraint: 'fk_inventory_store', col: 'int_Store_Id', parentTable: 'tbl_Store', parentCol: 'int_Store_Id', deleteRule: 'SET NULL', updateRule: 'RESTRICT' },
  { table: 'tbl_Inventory', constraint: 'fk_inventory_warehouse', col: 'int_Warehouse_Id', parentTable: 'tbl_Warehouse', parentCol: 'int_Warehouse_Id', deleteRule: 'SET NULL', updateRule: 'RESTRICT' },
  { table: 'tbl_Stock_Transaction', constraint: 'fk_stock_txn_product', col: 'int_Product_Id', parentTable: 'tbl_Product', parentCol: 'int_Product_Id', deleteRule: 'RESTRICT', updateRule: 'RESTRICT' },
  { table: 'tbl_Stock_Transaction', constraint: 'fk_stock_txn_store', col: 'int_Store_Id', parentTable: 'tbl_Store', parentCol: 'int_Store_Id', deleteRule: 'SET NULL', updateRule: 'RESTRICT' },
  { table: 'tbl_Stock_Transaction', constraint: 'fk_stock_txn_warehouse', col: 'int_Warehouse_Id', parentTable: 'tbl_Warehouse', parentCol: 'int_Warehouse_Id', deleteRule: 'SET NULL', updateRule: 'RESTRICT' },
  { table: 'tbl_Stock_Transaction', constraint: 'fk_stock_txn_user', col: 'int_User_Id', parentTable: 'tbl_User', parentCol: 'int_User_Id', deleteRule: 'SET NULL', updateRule: 'RESTRICT' },

  // 5. Orders & Line Items
  { table: 'tbl_Order', constraint: 'fk_order_customer', col: 'int_Customer_Id', parentTable: 'tbl_Customer', parentCol: 'int_Customer_Id', deleteRule: 'SET NULL', updateRule: 'RESTRICT' },
  { table: 'tbl_Order', constraint: 'fk_order_store', col: 'int_Store_Id', parentTable: 'tbl_Store', parentCol: 'int_Store_Id', deleteRule: 'RESTRICT', updateRule: 'RESTRICT' },
  { table: 'tbl_Order', constraint: 'fk_order_user', col: 'int_User_Id', parentTable: 'tbl_User', parentCol: 'int_User_Id', deleteRule: 'RESTRICT', updateRule: 'RESTRICT' },
  { table: 'tbl_Order', constraint: 'fk_order_payment_method', col: 'int_Payment_Method_Id', parentTable: 'tbl_Payment_Method', parentCol: 'int_Payment_Method_Id', deleteRule: 'SET NULL', updateRule: 'RESTRICT' },
  { table: 'tbl_Order_Item', constraint: 'fk_order_item_order', col: 'int_Order_Id', parentTable: 'tbl_Order', parentCol: 'int_Order_Id', deleteRule: 'RESTRICT', updateRule: 'RESTRICT' },
  { table: 'tbl_Order_Item', constraint: 'fk_order_item_product', col: 'int_Product_Id', parentTable: 'tbl_Product', parentCol: 'int_Product_Id', deleteRule: 'RESTRICT', updateRule: 'RESTRICT' },
  { table: 'tbl_Order_Item', constraint: 'fk_order_item_unit', col: 'int_Unit_Id', parentTable: 'tbl_Unit', parentCol: 'int_Unit_Id', deleteRule: 'SET NULL', updateRule: 'RESTRICT' },

  // 6. Purchasing
  { table: 'tbl_Purchase_Order', constraint: 'fk_po_supplier', col: 'int_Supplier_Id', parentTable: 'tbl_Supplier', parentCol: 'int_Supplier_Id', deleteRule: 'RESTRICT', updateRule: 'RESTRICT' },
  { table: 'tbl_Purchase_Order', constraint: 'fk_po_store', col: 'int_Store_Id', parentTable: 'tbl_Store', parentCol: 'int_Store_Id', deleteRule: 'SET NULL', updateRule: 'RESTRICT' },
  { table: 'tbl_Purchase_Order', constraint: 'fk_po_warehouse', col: 'int_Warehouse_Id', parentTable: 'tbl_Warehouse', parentCol: 'int_Warehouse_Id', deleteRule: 'SET NULL', updateRule: 'RESTRICT' },
  { table: 'tbl_Purchase_Order', constraint: 'fk_po_user', col: 'int_User_Id', parentTable: 'tbl_User', parentCol: 'int_User_Id', deleteRule: 'SET NULL', updateRule: 'RESTRICT' },
  { table: 'tbl_Purchase_Order_Item', constraint: 'fk_po_item_po', col: 'int_Purchase_Order_Id', parentTable: 'tbl_Purchase_Order', parentCol: 'int_Purchase_Order_Id', deleteRule: 'RESTRICT', updateRule: 'RESTRICT' },
  { table: 'tbl_Purchase_Order_Item', constraint: 'fk_po_item_product', col: 'int_Product_Id', parentTable: 'tbl_Product', parentCol: 'int_Product_Id', deleteRule: 'RESTRICT', updateRule: 'RESTRICT' },
  { table: 'tbl_Purchase_Order_Item', constraint: 'fk_po_item_unit', col: 'int_Unit_Id', parentTable: 'tbl_Unit', parentCol: 'int_Unit_Id', deleteRule: 'SET NULL', updateRule: 'RESTRICT' },

  // 7. Goods Receipts & Items
  { table: 'tbl_Goods_Receipt', constraint: 'fk_grn_po', col: 'int_Purchase_Order_Id', parentTable: 'tbl_Purchase_Order', parentCol: 'int_Purchase_Order_Id', deleteRule: 'RESTRICT', updateRule: 'RESTRICT' },
  { table: 'tbl_Goods_Receipt', constraint: 'fk_grn_warehouse', col: 'int_Warehouse_Id', parentTable: 'tbl_Warehouse', parentCol: 'int_Warehouse_Id', deleteRule: 'SET NULL', updateRule: 'RESTRICT' },
  { table: 'tbl_Goods_Receipt', constraint: 'fk_grn_store', col: 'int_Store_Id', parentTable: 'tbl_Store', parentCol: 'int_Store_Id', deleteRule: 'SET NULL', updateRule: 'RESTRICT' },
  { table: 'tbl_Goods_Receipt', constraint: 'fk_grn_received_by_user', col: 'int_Received_By_User_Id', parentTable: 'tbl_User', parentCol: 'int_User_Id', deleteRule: 'SET NULL', updateRule: 'RESTRICT' },
  { table: 'tbl_Goods_Receipt_Item', constraint: 'fk_grn_item_grn', col: 'int_Goods_Receipt_Id', parentTable: 'tbl_Goods_Receipt', parentCol: 'int_Goods_Receipt_Id', deleteRule: 'RESTRICT', updateRule: 'RESTRICT' },
  { table: 'tbl_Goods_Receipt_Item', constraint: 'fk_grn_item_po_item', col: 'int_Purchase_Order_Item_Id', parentTable: 'tbl_Purchase_Order_Item', parentCol: 'int_Purchase_Order_Item_Id', deleteRule: 'SET NULL', updateRule: 'RESTRICT' },
  { table: 'tbl_Goods_Receipt_Item', constraint: 'fk_grn_item_product', col: 'int_Product_Id', parentTable: 'tbl_Product', parentCol: 'int_Product_Id', deleteRule: 'RESTRICT', updateRule: 'RESTRICT' },

  // 8. Payments
  { table: 'tbl_Payment', constraint: 'fk_payment_order', col: 'int_Order_Id', parentTable: 'tbl_Order', parentCol: 'int_Order_Id', deleteRule: 'SET NULL', updateRule: 'RESTRICT' },
  { table: 'tbl_Payment', constraint: 'fk_payment_method', col: 'int_Payment_Method_Id', parentTable: 'tbl_Payment_Method', parentCol: 'int_Payment_Method_Id', deleteRule: 'RESTRICT', updateRule: 'RESTRICT' },
  { table: 'tbl_Payment', constraint: 'fk_payment_user', col: 'int_User_Id', parentTable: 'tbl_User', parentCol: 'int_User_Id', deleteRule: 'SET NULL', updateRule: 'RESTRICT' },
  { table: 'tbl_Payment', constraint: 'fk_payment_store', col: 'int_Store_Id', parentTable: 'tbl_Store', parentCol: 'int_Store_Id', deleteRule: 'SET NULL', updateRule: 'RESTRICT' },

  // 9. Returns & Items
  { table: 'tbl_Return', constraint: 'fk_return_order', col: 'int_Order_Id', parentTable: 'tbl_Order', parentCol: 'int_Order_Id', deleteRule: 'RESTRICT', updateRule: 'RESTRICT' },
  { table: 'tbl_Return', constraint: 'fk_return_customer', col: 'int_Customer_Id', parentTable: 'tbl_Customer', parentCol: 'int_Customer_Id', deleteRule: 'SET NULL', updateRule: 'RESTRICT' },
  { table: 'tbl_Return', constraint: 'fk_return_user', col: 'int_User_Id', parentTable: 'tbl_User', parentCol: 'int_User_Id', deleteRule: 'RESTRICT', updateRule: 'RESTRICT' },
  { table: 'tbl_Return', constraint: 'fk_return_store', col: 'int_Store_Id', parentTable: 'tbl_Store', parentCol: 'int_Store_Id', deleteRule: 'RESTRICT', updateRule: 'RESTRICT' },
  { table: 'tbl_Return_Item', constraint: 'fk_return_item_return', col: 'int_Return_Id', parentTable: 'tbl_Return', parentCol: 'int_Return_Id', deleteRule: 'RESTRICT', updateRule: 'RESTRICT' },
  { table: 'tbl_Return_Item', constraint: 'fk_return_item_order_item', col: 'int_Order_Item_Id', parentTable: 'tbl_Order_Item', parentCol: 'int_Order_Item_Id', deleteRule: 'SET NULL', updateRule: 'RESTRICT' },
  { table: 'tbl_Return_Item', constraint: 'fk_return_item_product', col: 'int_Product_Id', parentTable: 'tbl_Product', parentCol: 'int_Product_Id', deleteRule: 'RESTRICT', updateRule: 'RESTRICT' },

  // 10. Stock Transfers & Items
  { table: 'tbl_Stock_Transfer', constraint: 'fk_transfer_src_store', col: 'int_Source_Store_Id', parentTable: 'tbl_Store', parentCol: 'int_Store_Id', deleteRule: 'SET NULL', updateRule: 'RESTRICT' },
  { table: 'tbl_Stock_Transfer', constraint: 'fk_transfer_dest_store', col: 'int_Dest_Store_Id', parentTable: 'tbl_Store', parentCol: 'int_Store_Id', deleteRule: 'SET NULL', updateRule: 'RESTRICT' },
  { table: 'tbl_Stock_Transfer', constraint: 'fk_transfer_src_warehouse', col: 'int_Source_Warehouse_Id', parentTable: 'tbl_Warehouse', parentCol: 'int_Warehouse_Id', deleteRule: 'SET NULL', updateRule: 'RESTRICT' },
  { table: 'tbl_Stock_Transfer', constraint: 'fk_transfer_dest_warehouse', col: 'int_Dest_Warehouse_Id', parentTable: 'tbl_Warehouse', parentCol: 'int_Warehouse_Id', deleteRule: 'SET NULL', updateRule: 'RESTRICT' },
  { table: 'tbl_Stock_Transfer', constraint: 'fk_transfer_user', col: 'int_User_Id', parentTable: 'tbl_User', parentCol: 'int_User_Id', deleteRule: 'RESTRICT', updateRule: 'RESTRICT' },
  { table: 'tbl_Stock_Transfer_Item', constraint: 'fk_transfer_item_transfer', col: 'int_Transfer_Id', parentTable: 'tbl_Stock_Transfer', parentCol: 'int_Transfer_Id', deleteRule: 'RESTRICT', updateRule: 'RESTRICT' },
  { table: 'tbl_Stock_Transfer_Item', constraint: 'fk_transfer_item_product', col: 'int_Product_Id', parentTable: 'tbl_Product', parentCol: 'int_Product_Id', deleteRule: 'RESTRICT', updateRule: 'RESTRICT' },

  // 11. Inventory Adjustments
  { table: 'tbl_Inventory_Adjustment', constraint: 'fk_adj_product', col: 'int_Product_Id', parentTable: 'tbl_Product', parentCol: 'int_Product_Id', deleteRule: 'RESTRICT', updateRule: 'RESTRICT' },
  { table: 'tbl_Inventory_Adjustment', constraint: 'fk_adj_store', col: 'int_Store_Id', parentTable: 'tbl_Store', parentCol: 'int_Store_Id', deleteRule: 'SET NULL', updateRule: 'RESTRICT' },
  { table: 'tbl_Inventory_Adjustment', constraint: 'fk_adj_warehouse', col: 'int_Warehouse_Id', parentTable: 'tbl_Warehouse', parentCol: 'int_Warehouse_Id', deleteRule: 'SET NULL', updateRule: 'RESTRICT' },
  { table: 'tbl_Inventory_Adjustment', constraint: 'fk_adj_user', col: 'int_User_Id', parentTable: 'tbl_User', parentCol: 'int_User_Id', deleteRule: 'RESTRICT', updateRule: 'RESTRICT' },
  { table: 'tbl_Inventory_Adjustment', constraint: 'fk_adj_inventory', col: 'int_Inventory_Id', parentTable: 'tbl_Inventory', parentCol: 'int_Inventory_Id', deleteRule: 'SET NULL', updateRule: 'RESTRICT' },

  // 12. AI / Analytics / ML
  { table: 'tbl_Demand_Forecast', constraint: 'fk_forecast_product', col: 'int_Product_Id', parentTable: 'tbl_Product', parentCol: 'int_Product_Id', deleteRule: 'RESTRICT', updateRule: 'RESTRICT' },
  { table: 'tbl_Demand_Forecast', constraint: 'fk_forecast_store', col: 'int_Store_Id', parentTable: 'tbl_Store', parentCol: 'int_Store_Id', deleteRule: 'SET NULL', updateRule: 'RESTRICT' },
  { table: 'tbl_Stock_Risk', constraint: 'fk_stock_risk_product', col: 'int_Product_Id', parentTable: 'tbl_Product', parentCol: 'int_Product_Id', deleteRule: 'RESTRICT', updateRule: 'RESTRICT' },
  { table: 'tbl_Stock_Risk', constraint: 'fk_stock_risk_store', col: 'int_Store_Id', parentTable: 'tbl_Store', parentCol: 'int_Store_Id', deleteRule: 'SET NULL', updateRule: 'RESTRICT' },
  { table: 'tbl_AI_Recommendation', constraint: 'fk_ai_rec_product', col: 'int_Product_Id', parentTable: 'tbl_Product', parentCol: 'int_Product_Id', deleteRule: 'SET NULL', updateRule: 'RESTRICT' },
  { table: 'tbl_AI_Recommendation', constraint: 'fk_ai_rec_customer', col: 'int_Customer_Id', parentTable: 'tbl_Customer', parentCol: 'int_Customer_Id', deleteRule: 'SET NULL', updateRule: 'RESTRICT' },
  { table: 'tbl_AI_Recommendation', constraint: 'fk_ai_rec_store', col: 'int_Store_Id', parentTable: 'tbl_Store', parentCol: 'int_Store_Id', deleteRule: 'SET NULL', updateRule: 'RESTRICT' },
  { table: 'tbl_Customer_Segment', constraint: 'fk_cust_segment_customer', col: 'int_Customer_Id', parentTable: 'tbl_Customer', parentCol: 'int_Customer_Id', deleteRule: 'RESTRICT', updateRule: 'RESTRICT' },

  // 13. Logs & Notifications
  { table: 'tbl_Anomaly_Log', constraint: 'fk_anomaly_order', col: 'int_Order_Id', parentTable: 'tbl_Order', parentCol: 'int_Order_Id', deleteRule: 'SET NULL', updateRule: 'RESTRICT' },
  { table: 'tbl_Anomaly_Log', constraint: 'fk_anomaly_store', col: 'int_Store_Id', parentTable: 'tbl_Store', parentCol: 'int_Store_Id', deleteRule: 'SET NULL', updateRule: 'RESTRICT' },
  { table: 'tbl_Anomaly_Log', constraint: 'fk_anomaly_user', col: 'int_User_Id', parentTable: 'tbl_User', parentCol: 'int_User_Id', deleteRule: 'SET NULL', updateRule: 'RESTRICT' },
  { table: 'tbl_Chatbot_History', constraint: 'fk_chat_user', col: 'int_User_Id', parentTable: 'tbl_User', parentCol: 'int_User_Id', deleteRule: 'SET NULL', updateRule: 'RESTRICT' },
  { table: 'tbl_Chatbot_History', constraint: 'fk_chat_customer', col: 'int_Customer_Id', parentTable: 'tbl_Customer', parentCol: 'int_Customer_Id', deleteRule: 'SET NULL', updateRule: 'RESTRICT' },
  { table: 'tbl_Chatbot_History', constraint: 'fk_chat_store', col: 'int_Store_Id', parentTable: 'tbl_Store', parentCol: 'int_Store_Id', deleteRule: 'SET NULL', updateRule: 'RESTRICT' },
  { table: 'tbl_Login_Log', constraint: 'fk_login_user', col: 'int_User_Id', parentTable: 'tbl_User', parentCol: 'int_User_Id', deleteRule: 'RESTRICT', updateRule: 'RESTRICT' },
  { table: 'tbl_Notification', constraint: 'fk_notification_user', col: 'int_User_Id', parentTable: 'tbl_User', parentCol: 'int_User_Id', deleteRule: 'SET NULL', updateRule: 'RESTRICT' },
  { table: 'tbl_Notification', constraint: 'fk_notification_store', col: 'int_Store_Id', parentTable: 'tbl_Store', parentCol: 'int_Store_Id', deleteRule: 'SET NULL', updateRule: 'RESTRICT' },
  { table: 'tbl_Audit_Log', constraint: 'fk_audit_user', col: 'int_User_Id', parentTable: 'tbl_User', parentCol: 'int_User_Id', deleteRule: 'SET NULL', updateRule: 'RESTRICT' },
];

const indexDefinitions = [
  // POS & Inventory
  { table: 'tbl_Inventory', name: 'idx_inventory_product_store', columns: ['int_Product_Id', 'int_Store_Id'] },
  { table: 'tbl_Inventory', name: 'idx_inventory_warehouse_product', columns: ['int_Warehouse_Id', 'int_Product_Id'] },

  // Order Lookups & Line Items
  { table: 'tbl_Order_Item', name: 'idx_order_item_order', columns: ['int_Order_Id'] },
  { table: 'tbl_Order_Item', name: 'idx_order_item_product', columns: ['int_Product_Id'] },
  { table: 'tbl_Order', name: 'idx_order_customer_date', columns: ['int_Customer_Id', 'dte_Order_Date'] },
  { table: 'tbl_Order', name: 'idx_order_store_date', columns: ['int_Store_Id', 'dte_Order_Date'] },

  // Stock Ledger
  { table: 'tbl_Stock_Transaction', name: 'idx_stock_txn_product_date', columns: ['int_Product_Id', 'dte_Transaction_Date'] },
  { table: 'tbl_Stock_Transaction', name: 'idx_stock_txn_store_date', columns: ['int_Store_Id', 'dte_Transaction_Date'] },

  // AI & ML Lookups
  { table: 'tbl_Customer_Segment', name: 'idx_customer_segment_customer', columns: ['int_Customer_Id'] },
  { table: 'tbl_Demand_Forecast', name: 'idx_forecast_product_store', columns: ['int_Product_Id', 'int_Store_Id'] },
  { table: 'tbl_Stock_Risk', name: 'idx_stock_risk_product_store', columns: ['int_Product_Id', 'int_Store_Id'] },
  { table: 'tbl_AI_Recommendation', name: 'idx_ai_rec_customer_store', columns: ['int_Customer_Id', 'int_Store_Id'] },

  // Transaction Items
  { table: 'tbl_Payment', name: 'idx_payment_order', columns: ['int_Order_Id'] },
  { table: 'tbl_Purchase_Order_Item', name: 'idx_po_item_po', columns: ['int_Purchase_Order_Id'] },
  { table: 'tbl_Goods_Receipt_Item', name: 'idx_grn_item_grn', columns: ['int_Goods_Receipt_Id'] },
  { table: 'tbl_Return_Item', name: 'idx_return_item_return', columns: ['int_Return_Id'] },
  { table: 'tbl_Stock_Transfer_Item', name: 'idx_transfer_item_transfer', columns: ['int_Transfer_Id'] },

  // User & Logs
  { table: 'tbl_Chatbot_History', name: 'idx_chatbot_user_date', columns: ['int_User_Id', 'dte_Created_Date'] },
  { table: 'tbl_Notification', name: 'idx_notification_user_active', columns: ['int_User_Id', 'bit_IsActive'] },
  { table: 'tbl_Login_Log', name: 'idx_login_log_user_date', columns: ['int_User_Id', 'dte_Login_Time'] },
];

async function applyHardening() {
  console.log('====================================================');
  console.log('🔒 RetailMind AI — Applying FK & Index Hardening...');
  console.log('====================================================\n');

  const dbName = process.env.MYSQL_DATABASE || 'retailmind_ai';

  // 1. Fetch existing constraints
  const existingFks = await db.query(`
    SELECT CONSTRAINT_NAME, TABLE_NAME 
    FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
    WHERE TABLE_SCHEMA = ? AND CONSTRAINT_TYPE = 'FOREIGN KEY'
  `, [dbName]);
  const existingFkSet = new Set(existingFks.map(f => `${f.TABLE_NAME}.${f.CONSTRAINT_NAME}`));

  // 2. Fetch existing indexes
  const existingIndexes = await db.query(`
    SELECT INDEX_NAME, TABLE_NAME 
    FROM INFORMATION_SCHEMA.STATISTICS 
    WHERE TABLE_SCHEMA = ?
  `, [dbName]);
  const existingIndexSet = new Set(existingIndexes.map(i => `${i.TABLE_NAME}.${i.INDEX_NAME}`));

  let fksCreated = 0;
  let fksSkipped = 0;
  let indexesCreated = 0;
  let indexesSkipped = 0;

  // Apply Foreign Keys
  console.log('🔗 Applying Canonical Foreign Key Constraints...');
  for (const fk of fkDefinitions) {
    const key = `${fk.table}.${fk.constraint}`;
    if (existingFkSet.has(key)) {
      console.log(`  ⏩ FK '${fk.constraint}' on ${fk.table} already exists. Skipped.`);
      fksSkipped++;
      continue;
    }

    try {
      const sql = `
        ALTER TABLE \`${fk.table}\`
        ADD CONSTRAINT \`${fk.constraint}\`
        FOREIGN KEY (\`${fk.col}\`) REFERENCES \`${fk.parentTable}\` (\`${fk.parentCol}\`)
        ON DELETE ${fk.deleteRule} ON UPDATE ${fk.updateRule}
      `;
      await db.query(sql);
      console.log(`  ✅ Added FK: ${fk.table}.${fk.col} ➔ ${fk.parentTable}.${fk.parentCol} [${fk.constraint}]`);
      fksCreated++;
    } catch (err) {
      console.error(`  ❌ Failed to add FK ${fk.constraint} on ${fk.table}:`, err.message);
      throw err;
    }
  }

  // Apply Secondary Indexes
  console.log('\n⚡ Applying Evidence-Based Secondary Indexes...');
  for (const idx of indexDefinitions) {
    const key = `${idx.table}.${idx.name}`;
    if (existingIndexSet.has(key)) {
      console.log(`  ⏩ Index '${idx.name}' on ${idx.table} already exists. Skipped.`);
      indexesSkipped++;
      continue;
    }

    try {
      const colList = idx.columns.map(c => `\`${c}\``).join(', ');
      const sql = `CREATE INDEX \`${idx.name}\` ON \`${idx.table}\` (${colList})`;
      await db.query(sql);
      console.log(`  ✅ Created Index: ${idx.name} on ${idx.table}(${idx.columns.join(', ')})`);
      indexesCreated++;
    } catch (err) {
      console.error(`  ❌ Failed to create Index ${idx.name} on ${idx.table}:`, err.message);
      throw err;
    }
  }

  console.log('\n====================================================');
  console.log('🎉 Hardening Application Complete:');
  console.log(`   - Foreign Keys Added:   ${fksCreated}`);
  console.log(`   - Foreign Keys Skipped: ${fksSkipped}`);
  console.log(`   - Indexes Created:      ${indexesCreated}`);
  console.log(`   - Indexes Skipped:      ${indexesSkipped}`);
  console.log('====================================================\n');
}

if (require.main === module) {
  applyHardening()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Fatal hardening error:', err);
      process.exit(1);
    });
}

module.exports = { applyHardening, fkDefinitions, indexDefinitions };
