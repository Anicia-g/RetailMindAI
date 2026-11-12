-- ============================================================================
-- RetailMind AI — Step 3A: Database Foreign Key & Index Hardening Migration
-- Database: retailmind_ai (MySQL)
-- Scope: Canonical FK Constraints + Evidence-Based Indexes + Referential Integrity
-- ============================================================================

-- ----------------------------------------------------------------------------
-- SECTION 1: FOREIGN KEY CONSTRAINTS (Canonical Relational References)
-- ----------------------------------------------------------------------------

-- 1. Master / Security
ALTER TABLE `tbl_User`
  ADD CONSTRAINT `fk_user_role` FOREIGN KEY (`int_Role_Id`) REFERENCES `tbl_Role` (`int_Role_Id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  ADD CONSTRAINT `fk_user_store` FOREIGN KEY (`int_Store_Id`) REFERENCES `tbl_Store` (`int_Store_Id`) ON DELETE SET NULL ON UPDATE RESTRICT,
  ADD CONSTRAINT `fk_user_warehouse` FOREIGN KEY (`int_Warehouse_Id`) REFERENCES `tbl_Warehouse` (`int_Warehouse_Id`) ON DELETE SET NULL ON UPDATE RESTRICT;

ALTER TABLE `tbl_Store`
  ADD CONSTRAINT `fk_store_manager` FOREIGN KEY (`int_Manager_User_Id`) REFERENCES `tbl_User` (`int_User_Id`) ON DELETE SET NULL ON UPDATE RESTRICT;

ALTER TABLE `tbl_Warehouse`
  ADD CONSTRAINT `fk_warehouse_store` FOREIGN KEY (`int_Store_Id`) REFERENCES `tbl_Store` (`int_Store_Id`) ON DELETE SET NULL ON UPDATE RESTRICT,
  ADD CONSTRAINT `fk_warehouse_manager` FOREIGN KEY (`int_Manager_User_Id`) REFERENCES `tbl_User` (`int_User_Id`) ON DELETE SET NULL ON UPDATE RESTRICT;

ALTER TABLE `tbl_Category`
  ADD CONSTRAINT `fk_category_parent` FOREIGN KEY (`int_Parent_Category_Id`) REFERENCES `tbl_Category` (`int_Category_Id`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- 2. Customer
ALTER TABLE `tbl_Customer`
  ADD CONSTRAINT `fk_customer_store` FOREIGN KEY (`int_Store_Id`) REFERENCES `tbl_Store` (`int_Store_Id`) ON DELETE SET NULL ON UPDATE RESTRICT,
  ADD CONSTRAINT `fk_customer_pref_store` FOREIGN KEY (`int_Preferred_Store_Id`) REFERENCES `tbl_Store` (`int_Store_Id`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- 3. Product Master
ALTER TABLE `tbl_Product`
  ADD CONSTRAINT `fk_product_category` FOREIGN KEY (`int_Category_Id`) REFERENCES `tbl_Category` (`int_Category_Id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  ADD CONSTRAINT `fk_product_brand` FOREIGN KEY (`int_Brand_Id`) REFERENCES `tbl_Brand` (`int_Brand_Id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  ADD CONSTRAINT `fk_product_unit` FOREIGN KEY (`int_Unit_Id`) REFERENCES `tbl_Unit` (`int_Unit_Id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  ADD CONSTRAINT `fk_product_tax` FOREIGN KEY (`int_Tax_Id`) REFERENCES `tbl_Tax` (`int_Tax_Id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- 4. Inventory & Stock Ledger
ALTER TABLE `tbl_Inventory`
  ADD CONSTRAINT `fk_inventory_product` FOREIGN KEY (`int_Product_Id`) REFERENCES `tbl_Product` (`int_Product_Id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  ADD CONSTRAINT `fk_inventory_store` FOREIGN KEY (`int_Store_Id`) REFERENCES `tbl_Store` (`int_Store_Id`) ON DELETE SET NULL ON UPDATE RESTRICT,
  ADD CONSTRAINT `fk_inventory_warehouse` FOREIGN KEY (`int_Warehouse_Id`) REFERENCES `tbl_Warehouse` (`int_Warehouse_Id`) ON DELETE SET NULL ON UPDATE RESTRICT;

ALTER TABLE `tbl_Stock_Transaction`
  ADD CONSTRAINT `fk_stock_txn_product` FOREIGN KEY (`int_Product_Id`) REFERENCES `tbl_Product` (`int_Product_Id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  ADD CONSTRAINT `fk_stock_txn_store` FOREIGN KEY (`int_Store_Id`) REFERENCES `tbl_Store` (`int_Store_Id`) ON DELETE SET NULL ON UPDATE RESTRICT,
  ADD CONSTRAINT `fk_stock_txn_warehouse` FOREIGN KEY (`int_Warehouse_Id`) REFERENCES `tbl_Warehouse` (`int_Warehouse_Id`) ON DELETE SET NULL ON UPDATE RESTRICT,
  ADD CONSTRAINT `fk_stock_txn_user` FOREIGN KEY (`int_User_Id`) REFERENCES `tbl_User` (`int_User_Id`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- 5. Orders & Line Items
ALTER TABLE `tbl_Order`
  ADD CONSTRAINT `fk_order_customer` FOREIGN KEY (`int_Customer_Id`) REFERENCES `tbl_Customer` (`int_Customer_Id`) ON DELETE SET NULL ON UPDATE RESTRICT,
  ADD CONSTRAINT `fk_order_store` FOREIGN KEY (`int_Store_Id`) REFERENCES `tbl_Store` (`int_Store_Id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  ADD CONSTRAINT `fk_order_user` FOREIGN KEY (`int_User_Id`) REFERENCES `tbl_User` (`int_User_Id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  ADD CONSTRAINT `fk_order_payment_method` FOREIGN KEY (`int_Payment_Method_Id`) REFERENCES `tbl_Payment_Method` (`int_Payment_Method_Id`) ON DELETE SET NULL ON UPDATE RESTRICT;

ALTER TABLE `tbl_Order_Item`
  ADD CONSTRAINT `fk_order_item_order` FOREIGN KEY (`int_Order_Id`) REFERENCES `tbl_Order` (`int_Order_Id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  ADD CONSTRAINT `fk_order_item_product` FOREIGN KEY (`int_Product_Id`) REFERENCES `tbl_Product` (`int_Product_Id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  ADD CONSTRAINT `fk_order_item_unit` FOREIGN KEY (`int_Unit_Id`) REFERENCES `tbl_Unit` (`int_Unit_Id`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- 6. Purchasing (Purchase Orders & Items)
ALTER TABLE `tbl_Purchase_Order`
  ADD CONSTRAINT `fk_po_supplier` FOREIGN KEY (`int_Supplier_Id`) REFERENCES `tbl_Supplier` (`int_Supplier_Id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  ADD CONSTRAINT `fk_po_store` FOREIGN KEY (`int_Store_Id`) REFERENCES `tbl_Store` (`int_Store_Id`) ON DELETE SET NULL ON UPDATE RESTRICT,
  ADD CONSTRAINT `fk_po_warehouse` FOREIGN KEY (`int_Warehouse_Id`) REFERENCES `tbl_Warehouse` (`int_Warehouse_Id`) ON DELETE SET NULL ON UPDATE RESTRICT,
  ADD CONSTRAINT `fk_po_user` FOREIGN KEY (`int_User_Id`) REFERENCES `tbl_User` (`int_User_Id`) ON DELETE SET NULL ON UPDATE RESTRICT;

ALTER TABLE `tbl_Purchase_Order_Item`
  ADD CONSTRAINT `fk_po_item_po` FOREIGN KEY (`int_Purchase_Order_Id`) REFERENCES `tbl_Purchase_Order` (`int_Purchase_Order_Id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  ADD CONSTRAINT `fk_po_item_product` FOREIGN KEY (`int_Product_Id`) REFERENCES `tbl_Product` (`int_Product_Id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  ADD CONSTRAINT `fk_po_item_unit` FOREIGN KEY (`int_Unit_Id`) REFERENCES `tbl_Unit` (`int_Unit_Id`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- 7. Goods Receipts & Items
ALTER TABLE `tbl_Goods_Receipt`
  ADD CONSTRAINT `fk_grn_po` FOREIGN KEY (`int_Purchase_Order_Id`) REFERENCES `tbl_Purchase_Order` (`int_Purchase_Order_Id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  ADD CONSTRAINT `fk_grn_warehouse` FOREIGN KEY (`int_Warehouse_Id`) REFERENCES `tbl_Warehouse` (`int_Warehouse_Id`) ON DELETE SET NULL ON UPDATE RESTRICT,
  ADD CONSTRAINT `fk_grn_store` FOREIGN KEY (`int_Store_Id`) REFERENCES `tbl_Store` (`int_Store_Id`) ON DELETE SET NULL ON UPDATE RESTRICT,
  ADD CONSTRAINT `fk_grn_received_by_user` FOREIGN KEY (`int_Received_By_User_Id`) REFERENCES `tbl_User` (`int_User_Id`) ON DELETE SET NULL ON UPDATE RESTRICT;

ALTER TABLE `tbl_Goods_Receipt_Item`
  ADD CONSTRAINT `fk_grn_item_grn` FOREIGN KEY (`int_Goods_Receipt_Id`) REFERENCES `tbl_Goods_Receipt` (`int_Goods_Receipt_Id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  ADD CONSTRAINT `fk_grn_item_po_item` FOREIGN KEY (`int_Purchase_Order_Item_Id`) REFERENCES `tbl_Purchase_Order_Item` (`int_Purchase_Order_Item_Id`) ON DELETE SET NULL ON UPDATE RESTRICT,
  ADD CONSTRAINT `fk_grn_item_product` FOREIGN KEY (`int_Product_Id`) REFERENCES `tbl_Product` (`int_Product_Id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- 8. Payments
ALTER TABLE `tbl_Payment`
  ADD CONSTRAINT `fk_payment_order` FOREIGN KEY (`int_Order_Id`) REFERENCES `tbl_Order` (`int_Order_Id`) ON DELETE SET NULL ON UPDATE RESTRICT,
  ADD CONSTRAINT `fk_payment_method` FOREIGN KEY (`int_Payment_Method_Id`) REFERENCES `tbl_Payment_Method` (`int_Payment_Method_Id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  ADD CONSTRAINT `fk_payment_user` FOREIGN KEY (`int_User_Id`) REFERENCES `tbl_User` (`int_User_Id`) ON DELETE SET NULL ON UPDATE RESTRICT,
  ADD CONSTRAINT `fk_payment_store` FOREIGN KEY (`int_Store_Id`) REFERENCES `tbl_Store` (`int_Store_Id`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- 9. Returns & Items
ALTER TABLE `tbl_Return`
  ADD CONSTRAINT `fk_return_order` FOREIGN KEY (`int_Order_Id`) REFERENCES `tbl_Order` (`int_Order_Id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  ADD CONSTRAINT `fk_return_customer` FOREIGN KEY (`int_Customer_Id`) REFERENCES `tbl_Customer` (`int_Customer_Id`) ON DELETE SET NULL ON UPDATE RESTRICT,
  ADD CONSTRAINT `fk_return_user` FOREIGN KEY (`int_User_Id`) REFERENCES `tbl_User` (`int_User_Id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  ADD CONSTRAINT `fk_return_store` FOREIGN KEY (`int_Store_Id`) REFERENCES `tbl_Store` (`int_Store_Id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE `tbl_Return_Item`
  ADD CONSTRAINT `fk_return_item_return` FOREIGN KEY (`int_Return_Id`) REFERENCES `tbl_Return` (`int_Return_Id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  ADD CONSTRAINT `fk_return_item_order_item` FOREIGN KEY (`int_Order_Item_Id`) REFERENCES `tbl_Order_Item` (`int_Order_Item_Id`) ON DELETE SET NULL ON UPDATE RESTRICT,
  ADD CONSTRAINT `fk_return_item_product` FOREIGN KEY (`int_Product_Id`) REFERENCES `tbl_Product` (`int_Product_Id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- 10. Stock Transfers & Items
ALTER TABLE `tbl_Stock_Transfer`
  ADD CONSTRAINT `fk_transfer_src_store` FOREIGN KEY (`int_Source_Store_Id`) REFERENCES `tbl_Store` (`int_Store_Id`) ON DELETE SET NULL ON UPDATE RESTRICT,
  ADD CONSTRAINT `fk_transfer_dest_store` FOREIGN KEY (`int_Dest_Store_Id`) REFERENCES `tbl_Store` (`int_Store_Id`) ON DELETE SET NULL ON UPDATE RESTRICT,
  ADD CONSTRAINT `fk_transfer_src_warehouse` FOREIGN KEY (`int_Source_Warehouse_Id`) REFERENCES `tbl_Warehouse` (`int_Warehouse_Id`) ON DELETE SET NULL ON UPDATE RESTRICT,
  ADD CONSTRAINT `fk_transfer_dest_warehouse` FOREIGN KEY (`int_Dest_Warehouse_Id`) REFERENCES `tbl_Warehouse` (`int_Warehouse_Id`) ON DELETE SET NULL ON UPDATE RESTRICT,
  ADD CONSTRAINT `fk_transfer_user` FOREIGN KEY (`int_User_Id`) REFERENCES `tbl_User` (`int_User_Id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE `tbl_Stock_Transfer_Item`
  ADD CONSTRAINT `fk_transfer_item_transfer` FOREIGN KEY (`int_Transfer_Id`) REFERENCES `tbl_Stock_Transfer` (`int_Transfer_Id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  ADD CONSTRAINT `fk_transfer_item_product` FOREIGN KEY (`int_Product_Id`) REFERENCES `tbl_Product` (`int_Product_Id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- 11. Inventory Adjustments
ALTER TABLE `tbl_Inventory_Adjustment`
  ADD CONSTRAINT `fk_adj_product` FOREIGN KEY (`int_Product_Id`) REFERENCES `tbl_Product` (`int_Product_Id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  ADD CONSTRAINT `fk_adj_store` FOREIGN KEY (`int_Store_Id`) REFERENCES `tbl_Store` (`int_Store_Id`) ON DELETE SET NULL ON UPDATE RESTRICT,
  ADD CONSTRAINT `fk_adj_warehouse` FOREIGN KEY (`int_Warehouse_Id`) REFERENCES `tbl_Warehouse` (`int_Warehouse_Id`) ON DELETE SET NULL ON UPDATE RESTRICT,
  ADD CONSTRAINT `fk_adj_user` FOREIGN KEY (`int_User_Id`) REFERENCES `tbl_User` (`int_User_Id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  ADD CONSTRAINT `fk_adj_inventory` FOREIGN KEY (`int_Inventory_Id`) REFERENCES `tbl_Inventory` (`int_Inventory_Id`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- 12. AI / Analytics / ML
ALTER TABLE `tbl_Demand_Forecast`
  ADD CONSTRAINT `fk_forecast_product` FOREIGN KEY (`int_Product_Id`) REFERENCES `tbl_Product` (`int_Product_Id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  ADD CONSTRAINT `fk_forecast_store` FOREIGN KEY (`int_Store_Id`) REFERENCES `tbl_Store` (`int_Store_Id`) ON DELETE SET NULL ON UPDATE RESTRICT;

ALTER TABLE `tbl_Stock_Risk`
  ADD CONSTRAINT `fk_stock_risk_product` FOREIGN KEY (`int_Product_Id`) REFERENCES `tbl_Product` (`int_Product_Id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  ADD CONSTRAINT `fk_stock_risk_store` FOREIGN KEY (`int_Store_Id`) REFERENCES `tbl_Store` (`int_Store_Id`) ON DELETE SET NULL ON UPDATE RESTRICT;

ALTER TABLE `tbl_AI_Recommendation`
  ADD CONSTRAINT `fk_ai_rec_product` FOREIGN KEY (`int_Product_Id`) REFERENCES `tbl_Product` (`int_Product_Id`) ON DELETE SET NULL ON UPDATE RESTRICT,
  ADD CONSTRAINT `fk_ai_rec_customer` FOREIGN KEY (`int_Customer_Id`) REFERENCES `tbl_Customer` (`int_Customer_Id`) ON DELETE SET NULL ON UPDATE RESTRICT,
  ADD CONSTRAINT `fk_ai_rec_store` FOREIGN KEY (`int_Store_Id`) REFERENCES `tbl_Store` (`int_Store_Id`) ON DELETE SET NULL ON UPDATE RESTRICT;

ALTER TABLE `tbl_Customer_Segment`
  ADD CONSTRAINT `fk_cust_segment_customer` FOREIGN KEY (`int_Customer_Id`) REFERENCES `tbl_Customer` (`int_Customer_Id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- 13. Logs & Notifications
ALTER TABLE `tbl_Anomaly_Log`
  ADD CONSTRAINT `fk_anomaly_order` FOREIGN KEY (`int_Order_Id`) REFERENCES `tbl_Order` (`int_Order_Id`) ON DELETE SET NULL ON UPDATE RESTRICT,
  ADD CONSTRAINT `fk_anomaly_store` FOREIGN KEY (`int_Store_Id`) REFERENCES `tbl_Store` (`int_Store_Id`) ON DELETE SET NULL ON UPDATE RESTRICT,
  ADD CONSTRAINT `fk_anomaly_user` FOREIGN KEY (`int_User_Id`) REFERENCES `tbl_User` (`int_User_Id`) ON DELETE SET NULL ON UPDATE RESTRICT;

ALTER TABLE `tbl_Chatbot_History`
  ADD CONSTRAINT `fk_chat_user` FOREIGN KEY (`int_User_Id`) REFERENCES `tbl_User` (`int_User_Id`) ON DELETE SET NULL ON UPDATE RESTRICT,
  ADD CONSTRAINT `fk_chat_customer` FOREIGN KEY (`int_Customer_Id`) REFERENCES `tbl_Customer` (`int_Customer_Id`) ON DELETE SET NULL ON UPDATE RESTRICT,
  ADD CONSTRAINT `fk_chat_store` FOREIGN KEY (`int_Store_Id`) REFERENCES `tbl_Store` (`int_Store_Id`) ON DELETE SET NULL ON UPDATE RESTRICT;

ALTER TABLE `tbl_Login_Log`
  ADD CONSTRAINT `fk_login_user` FOREIGN KEY (`int_User_Id`) REFERENCES `tbl_User` (`int_User_Id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE `tbl_Notification`
  ADD CONSTRAINT `fk_notification_user` FOREIGN KEY (`int_User_Id`) REFERENCES `tbl_User` (`int_User_Id`) ON DELETE SET NULL ON UPDATE RESTRICT,
  ADD CONSTRAINT `fk_notification_store` FOREIGN KEY (`int_Store_Id`) REFERENCES `tbl_Store` (`int_Store_Id`) ON DELETE SET NULL ON UPDATE RESTRICT;

ALTER TABLE `tbl_Audit_Log`
  ADD CONSTRAINT `fk_audit_user` FOREIGN KEY (`int_User_Id`) REFERENCES `tbl_User` (`int_User_Id`) ON DELETE SET NULL ON UPDATE RESTRICT;


-- ----------------------------------------------------------------------------
-- SECTION 2: EVIDENCE-BASED SECONDARY INDEXES
-- ----------------------------------------------------------------------------

-- POS & Inventory Lookups
CREATE INDEX `idx_inventory_product_store` ON `tbl_Inventory` (`int_Product_Id`, `int_Store_Id`);
CREATE INDEX `idx_inventory_warehouse_product` ON `tbl_Inventory` (`int_Warehouse_Id`, `int_Product_Id`);

-- Order Lookups & Details
CREATE INDEX `idx_order_item_order` ON `tbl_Order_Item` (`int_Order_Id`);
CREATE INDEX `idx_order_item_product` ON `tbl_Order_Item` (`int_Product_Id`);
CREATE INDEX `idx_order_customer_date` ON `tbl_Order` (`int_Customer_Id`, `dte_Order_Date`);
CREATE INDEX `idx_order_store_date` ON `tbl_Order` (`int_Store_Id`, `dte_Order_Date`);

-- Inventory Ledger History
CREATE INDEX `idx_stock_txn_product_date` ON `tbl_Stock_Transaction` (`int_Product_Id`, `dte_Transaction_Date`);
CREATE INDEX `idx_stock_txn_store_date` ON `tbl_Stock_Transaction` (`int_Store_Id`, `dte_Transaction_Date`);

-- AI / Analytics / ML
CREATE INDEX `idx_customer_segment_customer` ON `tbl_Customer_Segment` (`int_Customer_Id`);
CREATE INDEX `idx_forecast_product_store` ON `tbl_Demand_Forecast` (`int_Product_Id`, `int_Store_Id`);
CREATE INDEX `idx_stock_risk_product_store` ON `tbl_Stock_Risk` (`int_Product_Id`, `int_Store_Id`);
CREATE INDEX `idx_ai_rec_customer_store` ON `tbl_AI_Recommendation` (`int_Customer_Id`, `int_Store_Id`);

-- Transactions & Items
CREATE INDEX `idx_payment_order` ON `tbl_Payment` (`int_Order_Id`);
CREATE INDEX `idx_po_item_po` ON `tbl_Purchase_Order_Item` (`int_Purchase_Order_Id`);
CREATE INDEX `idx_grn_item_grn` ON `tbl_Goods_Receipt_Item` (`int_Goods_Receipt_Id`);
CREATE INDEX `idx_return_item_return` ON `tbl_Return_Item` (`int_Return_Id`);
CREATE INDEX `idx_transfer_item_transfer` ON `tbl_Stock_Transfer_Item` (`int_Transfer_Id`);

-- User & Logs
CREATE INDEX `idx_chatbot_user_date` ON `tbl_Chatbot_History` (`int_User_Id`, `dte_Created_Date`);
CREATE INDEX `idx_notification_user_active` ON `tbl_Notification` (`int_User_Id`, `bit_IsActive`);
CREATE INDEX `idx_login_log_user_date` ON `tbl_Login_Log` (`int_User_Id`, `dte_Login_Time`);
