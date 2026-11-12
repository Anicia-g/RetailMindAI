/**
 * RetailMind AI — MySQL Database Seeder
 * Populates all 37 relational tables with realistic supermarket baseline data.
 * Foreign Key constraints strictly honored.
 */
const bcrypt = require('bcryptjs');
const db = require('../config/db');

async function seedDatabase() {
  console.log('====================================================');
  console.log('🌱 Starting RetailMind AI Relational MySQL Seeder...');
  console.log('====================================================\n');

  const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
  const todayDate = new Date().toISOString().slice(0, 10);
  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Disable Foreign Key Checks for clean truncation
  await db.query('SET FOREIGN_KEY_CHECKS = 0');

  const allTables = [
    'tbl_AI_Recommendation',
    'tbl_Anomaly_Log',
    'tbl_Audit_Log',
    'tbl_Brand',
    'tbl_Category',
    'tbl_Chatbot_History',
    'tbl_Customer',
    'tbl_Customer_Segment',
    'tbl_Demand_Forecast',
    'tbl_Goods_Receipt',
    'tbl_Goods_Receipt_Item',
    'tbl_Inventory',
    'tbl_Inventory_Adjustment',
    'tbl_Login_Log',
    'tbl_Model_Performance',
    'tbl_Notification',
    'tbl_Order',
    'tbl_Order_Item',
    'tbl_Payment',
    'tbl_Payment_Method',
    'tbl_Product',
    'tbl_Purchase_Order',
    'tbl_Purchase_Order_Item',
    'tbl_Return',
    'tbl_Return_Item',
    'tbl_Role',
    'tbl_Settings',
    'tbl_Stock_Risk',
    'tbl_Stock_Transaction',
    'tbl_Stock_Transfer',
    'tbl_Stock_Transfer_Item',
    'tbl_Store',
    'tbl_Supplier',
    'tbl_Tax',
    'tbl_Unit',
    'tbl_User',
    'tbl_Warehouse',
  ];

  console.log('🧹 Truncating 37 tables...');
  for (const table of allTables) {
    await db.query(`TRUNCATE TABLE \`${table}\``);
  }

  // 2. Insert Roles (tbl_Role)
  console.log('👤 Seeding Roles...');
  await db.query(`
    INSERT INTO tbl_Role (
      int_Role_Id, txt_Role_Code, txt_Role_Name, txt_Role_Description,
      bit_Is_System_Role, bit_Can_Manage_Users, bit_Can_Manage_Inventory, bit_Can_Manage_Sales,
      bit_Can_Manage_Purchase, bit_Can_View_Reports, bit_Can_Manage_Settings, int_Access_Level,
      bit_Can_Approve_Purchase_Orders, bit_Can_View_Financial_Data, bit_Can_Manage_Customers,
      bit_Can_Manage_Suppliers, bit_Can_Export_Data,
      dte_Created_Date, txt_Created_By, dte_Modified_Date, txt_Modified_By, bit_IsActive
    ) VALUES
    (1, 'ADMIN', 'Administrator', 'Full system access & administration', 1, 1, 1, 1, 1, 1, 1, 100, 1, 1, 1, 1, 1, '${now}', 'system', '${now}', 'system', 1),
    (2, 'SELLER', 'Seller / Cashier', 'POS sales, inventory lookup & returns', 1, 0, 1, 1, 0, 1, 0, 50, 0, 0, 1, 0, 0, '${now}', 'system', '${now}', 'system', 1),
    (3, 'CUSTOMER', 'Online Shopper', 'E-commerce browsing, ordering & loyalty', 1, 0, 0, 0, 0, 0, 0, 10, 0, 0, 0, 0, 0, '${now}', 'system', '${now}', 'system', 1),
    (4, 'MANAGER', 'Store Manager', 'Store operations, inventory & sales reporting', 1, 0, 1, 1, 1, 1, 0, 75, 1, 1, 1, 1, 1, '${now}', 'system', '${now}', 'system', 1)
  `);

  // 3. Insert Stores (tbl_Store)
  console.log('🏬 Seeding Stores...');
  await db.query(`
    INSERT INTO tbl_Store (
      int_Store_Id, txt_Store_Code, txt_Store_Name, txt_Store_Type,
      txt_Address_Line1, txt_Address_Line2, txt_City, txt_State, txt_Country, txt_Pincode,
      txt_Contact_Number, txt_Email, txt_Manager_Name, int_Manager_User_Id,
      dec_Store_Area_Sqft, dte_Opening_Date, txt_Operating_Hours,
      bit_Is_Warehouse_Attached, bit_Is_Head_Office, dec_Monthly_Rent, txt_Time_Zone,
      dte_Created_Date, txt_Created_By, dte_Modified_Date, txt_Modified_By, bit_IsActive
    ) VALUES
    (1, 'STORE001', 'Indiranagar Flagship (Store 01)', 'Flagship Supermarket', '100ft Road, Indiranagar', 'HAL 2nd Stage', 'Bangalore', 'Karnataka', 'India', '560038', '+91 80 2525 0001', 'store01@retailmind.ai', 'Sarah Khan', 2, 8500.00, '2023-01-15', '07:00 AM - 11:00 PM', 1, 1, 250000.00, 'Asia/Kolkata', '${now}', 'system', '${now}', 'system', 1),
    (2, 'STORE002', 'Koramangala Supermart (Store 02)', 'Express Mart', '80ft Road, 4th Block, Koramangala', 'Near Sony Signal', 'Bangalore', 'Karnataka', 'India', '560034', '+91 80 2525 0002', 'store02@retailmind.ai', 'Rahul Verma', 4, 4500.00, '2023-06-01', '08:00 AM - 11:00 PM', 0, 0, 180000.00, 'Asia/Kolkata', '${now}', 'system', '${now}', 'system', 1),
    (3, 'STORE003', 'Whitefield Hypermarket (Store 03)', 'Hypermarket', 'ITPL Main Road, Whitefield', 'Opposite Prestige Shantiniketan', 'Bangalore', 'Karnataka', 'India', '560066', '+91 80 2525 0003', 'store03@retailmind.ai', 'Anita Desai', NULL, 15000.00, '2023-11-20', '08:00 AM - 10:30 PM', 1, 0, 420000.00, 'Asia/Kolkata', '${now}', 'system', '${now}', 'system', 1)
  `);

  // 4. Insert Warehouses (tbl_Warehouse)
  console.log('🏭 Seeding Warehouses...');
  await db.query(`
    INSERT INTO tbl_Warehouse (
      int_Warehouse_Id, txt_Warehouse_Code, txt_Warehouse_Name, int_Store_Id,
      txt_Address_Line1, txt_City, txt_State, txt_Country, txt_Pincode,
      txt_Contact_Number, dec_Storage_Capacity_Sqft, txt_Warehouse_Type,
      int_Manager_User_Id, bit_Is_Climate_Controlled, txt_Warehouse_Manager_Contact,
      int_Total_Rack_Count, bit_Is_Active_For_Transfers,
      dte_Created_Date, txt_Created_By, dte_Modified_Date, txt_Modified_By, bit_IsActive
    ) VALUES
    (1, 'WH001', 'Central Fulfillment Warehouse', 1, 'Plot 42, Hoodi Industrial Area', 'Bangalore', 'Karnataka', 'India', '560048', '+91 80 4141 9001', 35000.00, 'Central Hub', 1, 1, '+91 98450 90001', 120, 1, '${now}', 'system', '${now}', 'system', 1),
    (2, 'WH002', 'East Regional Depot', 3, 'Plot 12, Whitefield Logistics Park', 'Bangalore', 'Karnataka', 'India', '560067', '+91 80 4141 9002', 20000.00, 'Regional Depot', 2, 1, '+91 98450 90002', 80, 1, '${now}', 'system', '${now}', 'system', 1)
  `);

  // 5. Insert Users (tbl_User)
  console.log('👥 Seeding Users...');
  await db.query(`
    INSERT INTO tbl_User (
      int_User_Id, txt_Employee_Code, txt_First_Name, txt_Last_Name, txt_Email,
      txt_Phone_Number, txt_Password_Hash, txt_Username, int_Role_Id, int_Store_Id,
      txt_Address, txt_Profile_Image_Url, dte_Date_Of_Birth, txt_Gender,
      dte_Date_Of_Joining, bit_Is_Locked, int_Failed_Login_Attempts, dte_Last_Login_Date,
      dte_Created_Date, txt_Created_By, dte_Modified_Date, txt_Modified_By, bit_IsActive
    ) VALUES
    (1, 'EMP001', 'Admin', 'User', 'admin@retailmind.ai', '+91 98450 00001', '${passwordHash}', 'admin', 1, 1, 'Bangalore Central', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80', '1988-04-12', 'MALE', '2022-01-01', 0, 0, '${now}', '${now}', 'system', '${now}', 'system', 1),
    (2, 'EMP002', 'Sarah', 'Khan', 'seller@retailmind.ai', '+91 98450 00002', '${passwordHash}', 'seller', 2, 1, 'Indiranagar, Bangalore', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80', '1992-08-24', 'FEMALE', '2022-06-15', 0, 0, '${now}', '${now}', 'system', '${now}', 'system', 1),
    (3, 'EMP003', 'Priya', 'Sharma', 'customer@retailmind.ai', '+91 98450 00003', '${passwordHash}', 'customer', 3, 1, 'HAL 2nd Stage, Bangalore', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=160&q=80', '1995-11-03', 'FEMALE', '2023-01-10', 0, 0, '${now}', '${now}', 'system', '${now}', 'system', 1),
    (4, 'EMP004', 'Rahul', 'Verma', 'rahul.seller@retailmind.ai', '+91 98450 00004', '${passwordHash}', 'rahul', 2, 2, 'Koramangala, Bangalore', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80', '1990-03-18', 'MALE', '2023-03-01', 0, 0, '${now}', '${now}', 'system', '${now}', 'system', 1)
  `);

  // 6. Insert Categories (tbl_Category)
  console.log('🏷️ Seeding Categories...');
  await db.query(`
    INSERT INTO tbl_Category (
      int_Category_Id, txt_Category_Name, txt_Category_Code, txt_Category_Description,
      int_Parent_Category_Id, txt_Category_Image_Url, txt_Category_Slug, int_Display_Order,
      bit_Is_Perishable, bit_Is_Featured, bit_Requires_Age_Verification, bit_Is_Active_For_Online_Sale,
      dte_Created_Date, txt_Created_By, dte_Modified_Date, txt_Modified_By, bit_IsActive
    ) VALUES
    (1, 'Dairy & Eggs', 'CAT001', 'Fresh milk, curd, artisanal cheeses, paneer, and eggs', NULL, 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=400&q=80', 'dairy-eggs', 1, 1, 1, 0, 1, '${now}', 'system', '${now}', 'system', 1),
    (2, 'Bakery & Breads', 'CAT002', 'Artisanal sourdough, whole wheat bread, cookies, and pastries', NULL, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80', 'bakery-breads', 2, 1, 1, 0, 1, '${now}', 'system', '${now}', 'system', 1),
    (3, 'Fresh Produce', 'CAT003', 'Organic fresh fruits, leafy greens, and farm-picked vegetables', NULL, 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=400&q=80', 'fresh-produce', 3, 1, 1, 0, 1, '${now}', 'system', '${now}', 'system', 1),
    (4, 'Beverages', 'CAT004', 'Cold pressed juices, organic kombucha, artisanal tea and coffee', NULL, 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?auto=format&fit=crop&w=400&q=80', 'beverages', 4, 0, 1, 0, 1, '${now}', 'system', '${now}', 'system', 1),
    (5, 'Pantry & Staples', 'CAT005', 'Grains, cold-pressed oils, organic pulses, spices and seasonings', NULL, 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80', 'pantry-staples', 5, 0, 0, 0, 1, '${now}', 'system', '${now}', 'system', 1),
    (6, 'Snacks & Confectionery', 'CAT006', 'Protein energy bars, roasted nuts, trail mixes, dark chocolates', NULL, 'https://images.unsplash.com/photo-1622484216802-53b47c94eb5f?auto=format&fit=crop&w=400&q=80', 'snacks-confectionery', 6, 0, 0, 0, 1, '${now}', 'system', '${now}', 'system', 1)
  `);

  // 7. Insert Brands (tbl_Brand)
  console.log('🏷️ Seeding Brands...');
  await db.query(`
    INSERT INTO tbl_Brand (
      int_Brand_Id, txt_Brand_Name, txt_Brand_Code, txt_Brand_Description,
      txt_Manufacturer_Name, txt_Country_Of_Origin, bit_Is_Preferred_Brand, bit_Is_Exclusive_Brand,
      dte_Created_Date, txt_Created_By, dte_Modified_Date, txt_Modified_By, bit_IsActive
    ) VALUES
    (1, 'Organic Tattva', 'BRD001', 'Certified 100% organic pulses, grains, and kitchen staples', 'Mehrotra Consumer Products', 'India', 1, 0, '${now}', 'system', '${now}', 'system', 1),
    (2, 'RetailMind Fresh', 'BRD002', 'In-house certified farm-fresh daily essentials', 'RetailMind Farms Hub', 'India', 1, 1, '${now}', 'system', '${now}', 'system', 1),
    (3, 'Epigamia', 'BRD003', 'High-protein Greek yogurts and artisanal dairy desserts', 'Drums Food International', 'India', 1, 0, '${now}', 'system', '${now}', 'system', 1),
    (4, 'The Bakers Dozen', 'BRD004', '100% whole wheat sourdough breads, cakes, and crackers', 'The Bakers Dozen Foods', 'India', 1, 0, '${now}', 'system', '${now}', 'system', 1),
    (5, 'Raw Pressery', 'BRD005', 'Cold-pressed 100% fruit and vegetable juices without sugar', 'Rakyan Beverages', 'India', 1, 0, '${now}', 'system', '${now}', 'system', 1),
    (6, 'Yoga Bar', 'BRD006', 'Clean protein nutrition bars, peanut butters, and muesli', 'Sproutlife Foods', 'India', 1, 0, '${now}', 'system', '${now}', 'system', 1)
  `);

  // 8. Insert Units (tbl_Unit)
  console.log('⚖️ Seeding Units...');
  await db.query(`
    INSERT INTO tbl_Unit (
      int_Unit_Id, txt_Unit_Code, txt_Unit_Name, txt_Unit_Symbol, txt_Symbol, txt_Unit_Type,
      bit_Is_Base_Unit, dec_Conversion_Factor, bit_Allows_Decimal, int_Decimal_Places,
      bit_Is_Custom_Unit, bit_Is_Purchase_Unit, bit_Is_Sales_Unit,
      dte_Created_Date, txt_Created_By, dte_Modified_Date, txt_Modified_By, bit_IsActive
    ) VALUES
    (1, 'PCS', 'Piece', 'pc', 'pc', 'Count', 1, 1.00, 0, 0, 0, 1, 1, '${now}', 'system', '${now}', 'system', 1),
    (2, 'KG', 'Kilogram', 'kg', 'kg', 'Weight', 1, 1.00, 1, 3, 0, 1, 1, '${now}', 'system', '${now}', 'system', 1),
    (3, 'G', 'Gram', 'g', 'g', 'Weight', 0, 0.001, 1, 2, 0, 1, 1, '${now}', 'system', '${now}', 'system', 1),
    (4, 'LTR', 'Litre', 'L', 'L', 'Volume', 1, 1.00, 1, 2, 0, 1, 1, '${now}', 'system', '${now}', 'system', 1),
    (5, 'PKT', 'Pack', 'pk', 'pk', 'Package', 1, 1.00, 0, 0, 0, 1, 1, '${now}', 'system', '${now}', 'system', 1)
  `);

  // 9. Insert Taxes (tbl_Tax)
  console.log('💰 Seeding Taxes...');
  await db.query(`
    INSERT INTO tbl_Tax (
      int_Tax_Id, txt_Tax_Name, txt_Tax_Code, dec_Tax_Percentage, dec_Tax_Rate, txt_Tax_Type,
      bit_Is_Inclusive, dte_Effective_From, bit_Is_Default, bit_Is_Compound_Tax,
      dte_Created_Date, txt_Created_By, dte_Modified_Date, txt_Modified_By, bit_IsActive
    ) VALUES
    (1, 'GST 0% (Exempt)', 'GST0', 0.00, 0.00, 'GST', 0, '2022-01-01', 0, 0, '${now}', 'system', '${now}', 'system', 1),
    (2, 'GST 5% (Essentials)', 'GST5', 5.00, 5.00, 'GST', 0, '2022-01-01', 1, 0, '${now}', 'system', '${now}', 'system', 1),
    (3, 'GST 12% (Processed)', 'GST12', 12.00, 12.00, 'GST', 0, '2022-01-01', 0, 0, '${now}', 'system', '${now}', 'system', 1),
    (4, 'GST 18% (Standard)', 'GST18', 18.00, 18.00, 'GST', 0, '2022-01-01', 0, 0, '${now}', 'system', '${now}', 'system', 1)
  `);

  // 10. Insert Payment Methods (tbl_Payment_Method)
  console.log('💳 Seeding Payment Methods...');
  await db.query(`
    INSERT INTO tbl_Payment_Method (
      int_Payment_Method_Id, txt_Payment_Method_Name, txt_Method_Name, txt_Payment_Method_Code, txt_Method_Code, txt_Payment_Type, txt_Method_Type,
      bit_Requires_Reference_Number, bit_Is_Online, bit_Is_Active_For_POS, bit_Requires_OTP_Verification,
      dte_Created_Date, txt_Created_By, dte_Modified_Date, txt_Modified_By, bit_IsActive
    ) VALUES
    (1, 'Cash on Counter', 'Cash on Counter', 'CASH', 'CASH', 'Cash', 'Cash', 0, 0, 1, 0, '${now}', 'system', '${now}', 'system', 1),
    (2, 'UPI / QR Code (PhonePe, GPay)', 'UPI / QR Code (PhonePe, GPay)', 'UPI', 'UPI', 'Digital', 'Digital', 1, 1, 1, 0, '${now}', 'system', '${now}', 'system', 1),
    (3, 'Credit Card (Visa / MC)', 'Credit Card (Visa / MC)', 'CC', 'CC', 'Card', 'Card', 1, 1, 1, 0, '${now}', 'system', '${now}', 'system', 1),
    (4, 'Debit Card POS Swipe', 'Debit Card POS Swipe', 'DC', 'DC', 'Card', 'Card', 1, 0, 1, 0, '${now}', 'system', '${now}', 'system', 1),
    (5, 'Smart Wallet Points', 'Smart Wallet Points', 'WALLET', 'WALLET', 'Wallet', 'Wallet', 0, 1, 1, 0, '${now}', 'system', '${now}', 'system', 1)
  `);

  // 11. Insert Suppliers (tbl_Supplier)
  console.log('🚚 Seeding Suppliers...');
  await db.query(`
    INSERT INTO tbl_Supplier (
      int_Supplier_Id, txt_Supplier_Code, txt_Supplier_Name, txt_Contact_Person, txt_Contact_Person_Name,
      txt_Email, txt_Phone, txt_Contact_Number, txt_Address, txt_Address_Line1, txt_City, txt_State, txt_Country,
      txt_Pincode, int_Credit_Period_Days, dec_Average_Lead_Time_Days, dec_Rating, bit_Is_Preferred_Supplier,
      dte_Created_Date, txt_Created_By, dte_Modified_Date, txt_Modified_By, bit_IsActive
    ) VALUES
    (1, 'SUP001', 'DairyFresh Farms Ltd', 'Ramesh Patel', 'Ramesh Patel', 'contact@dairyfresh.com', '+91 98250 12345', '+91 98250 12345', 'Anand Dairy Complex', 'Anand Dairy Complex', 'Anand', 'Gujarat', 'India', '388001', 15, 2.0, 4.8, 1, '${now}', 'system', '${now}', 'system', 1),
    (2, 'SUP002', 'Golden Harvest Mills', 'Gurpreet Singh', 'Gurpreet Singh', 'sales@goldenharvest.com', '+91 98140 23456', '+91 98140 23456', 'Industrial Area B', 'Industrial Area B', 'Ludhiana', 'Punjab', 'India', '141003', 30, 4.0, 4.6, 0, '${now}', 'system', '${now}', 'system', 1),
    (3, 'SUP003', 'BioGreen Organics', 'Suresh Reddy', 'Suresh Reddy', 'orders@biogreen.in', '+91 98450 34567', '+91 98450 34567', 'Doddaballapura Industrial Park', 'Doddaballapura Industrial Park', 'Bangalore', 'Karnataka', 'India', '561203', 7, 1.0, 4.9, 1, '${now}', 'system', '${now}', 'system', 1),
    (4, 'SUP004', 'Sunrise Bakery Co.', 'Naveen Kumar', 'Naveen Kumar', 'supplies@sunrisebakery.com', '+91 98800 45678', '+91 98800 45678', 'Peenya 2nd Stage', 'Peenya 2nd Stage', 'Bangalore', 'Karnataka', 'India', '560058', 10, 1.5, 4.7, 1, '${now}', 'system', '${now}', 'system', 1),
    (5, 'SUP005', 'AgroPure Essentials', 'Mahesh Hegde', 'Mahesh Hegde', 'wholesale@agropure.com', '+91 98451 56789', '+91 98451 56789', 'APMC Yard, Yeshwanthpur', 'APMC Yard, Yeshwanthpur', 'Bangalore', 'Karnataka', 'India', '560022', 21, 3.0, 4.5, 0, '${now}', 'system', '${now}', 'system', 1)
  `);

  // 12. Insert Customers (tbl_Customer)
  console.log('🛒 Seeding Customers...');
  await db.query(`
    INSERT INTO tbl_Customer (
      int_Customer_Id, txt_Customer_Code, txt_Customer_Name, txt_First_Name, txt_Last_Name, txt_Email,
      txt_Phone, txt_Phone_Number, txt_Address, txt_Address_Line1, txt_City, txt_State, txt_Country, txt_Pincode,
      int_Store_Id, int_Preferred_Store_Id, txt_Customer_Type, int_Loyalty_Points, dec_Total_Spend, dec_Total_Purchase_Amount,
      dte_Registration_Date, dte_Last_Purchase_Date, bit_Is_VIP, txt_Referral_Source,
      txt_Communication_Preference,
      dte_Created_Date, txt_Created_By, dte_Modified_Date, txt_Modified_By, bit_IsActive
    ) VALUES
    (1, 'CUST0001', 'Priya Sharma', 'Priya', 'Sharma', 'priya.sharma@retailmind.ai', '+91 98450 11234', '+91 98450 11234', '1202, HAL 2nd Stage', '1202, HAL 2nd Stage', 'Bangalore', 'Karnataka', 'India', '560038', 1, 1, 'Regular Shopper', 450, 15400.00, 15400.00, '2023-01-10', '${now}', 1, 'Store Walkin', 'WHATSAPP', '${now}', 'system', '${now}', 'system', 1),
    (2, 'CUST0002', 'Rahul Verma', 'Rahul', 'Verma', 'rahul.verma@example.com', '+91 98450 22345', '+91 98450 22345', '45, 4th Cross, Koramangala', '45, 4th Cross, Koramangala', 'Bangalore', 'Karnataka', 'India', '560034', 2, 2, 'Regular Shopper', 180, 6800.00, 6800.00, '2023-02-15', '${now}', 0, 'Online Promo', 'WHATSAPP', '${now}', 'system', '${now}', 'system', 1),
    (3, 'CUST0003', 'Anita Desai', 'Anita', 'Desai', 'anita.desai@example.com', '+91 98450 33456', '+91 98450 33456', '88, Prestige Palms, Whitefield', '88, Prestige Palms, Whitefield', 'Bangalore', 'Karnataka', 'India', '560066', 3, 3, 'VIP Shopper', 920, 34500.00, 34500.00, '2023-01-05', '${now}', 1, 'Friend Referral', 'ALL', '${now}', 'system', '${now}', 'system', 1),
    (4, 'CUST0004', 'Vikram Singh', 'Vikram', 'Singh', 'vikram.singh@example.com', '+91 98450 44567', '+91 98450 44567', '12, Brigade Road', '12, Brigade Road', 'Bangalore', 'Karnataka', 'India', '560001', 1, 1, 'Occasional Shopper', 60, 2400.00, 2400.00, '2023-04-12', '${now}', 0, 'Walkin', 'OPT_OUT', '${now}', 'system', '${now}', 'system', 1),
    (5, 'CUST0005', 'Neha Kapoor', 'Neha', 'Kapoor', 'neha.kapoor@example.com', '+91 98450 55678', '+91 98450 55678', '501, JP Nagar 6th Phase', '501, JP Nagar 6th Phase', 'Bangalore', 'Karnataka', 'India', '560078', 1, 1, 'Loyal Shopper', 580, 21900.00, 21900.00, '2023-03-20', '${now}', 1, 'Instagram Ads', 'ALL', '${now}', 'system', '${now}', 'system', 1)
  `);

  // 13. Insert Products (tbl_Product)
  console.log('📦 Seeding Products...');
  const products = [
    [1, 'PRD001', 'Fresh Organic Whole Milk 1L', 'Pasteurized cold-chain farm whole cow milk', 1, 2, 4, 1, '890103000001', 'SKU-MLK-01', 52.00, 68.00, 72.00, 5.0, 30, 50, 15, 120, 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=400&q=80', 1.0, 1, 4],
    [2, 'PRD002', 'Epigamia Greek Yogurt Blueberry 120g', 'High protein authentic greek yogurt with real blueberries', 1, 3, 1, 2, '890103000002', 'SKU-YGT-02', 42.00, 60.00, 65.00, 8.0, 25, 40, 10, 100, 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=400&q=80', 0.12, 1, 14],
    [3, 'PRD003', 'Artisanal Sourdough Country Loaf 400g', 'Stone-baked fermented sourdough bread', 2, 4, 1, 2, '890103000003', 'SKU-SRD-03', 95.00, 145.00, 155.00, 6.0, 15, 30, 8, 60, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80', 0.40, 1, 3],
    [4, 'PRD004', 'Whole Wheat Multigrain Bread 400g', '100% whole wheat 7-grain fiber rich sandwich bread', 2, 4, 1, 2, '890103000004', 'SKU-BRD-04', 38.00, 55.00, 60.00, 8.0, 20, 40, 10, 80, 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&w=400&q=80', 0.40, 1, 5],
    [5, 'PRD005', 'Farm Fresh Hass Avocados (2 pcs)', 'Ripe creamy Hass avocados rich in healthy fats', 3, 2, 5, 1, '890103000005', 'SKU-AVO-05', 120.00, 185.00, 210.00, 12.0, 12, 25, 6, 50, 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=400&q=80', 0.35, 1, 6],
    [6, 'PRD006', 'Organic Baby Spinach Hydroponic 200g', 'Tender pre-washed zero pesticide baby spinach', 3, 2, 5, 1, '890103000006', 'SKU-SPN-06', 32.00, 48.00, 55.00, 12.0, 15, 30, 8, 60, 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=400&q=80', 0.20, 1, 4],
    [7, 'PRD007', 'Raw Pressery Valencia Orange 250ml', 'Cold-pressed 100% natural orange juice without preservatives', 4, 5, 1, 3, '890103000007', 'SKU-ORJ-07', 58.00, 85.00, 95.00, 10.0, 20, 40, 10, 90, 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?auto=format&fit=crop&w=400&q=80', 0.25, 1, 21],
    [8, 'PRD008', 'Raw Pressery Coconut Water 200ml', 'Pure natural electrolyte hydration coconut water', 4, 5, 1, 2, '890103000008', 'SKU-COC-08', 35.00, 50.00, 55.00, 9.0, 30, 60, 15, 150, 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=400&q=80', 0.20, 0, 90],
    [9, 'PRD009', 'Organic Tattva Cold Pressed Mustard Oil 1L', 'Traditional kachi ghani unrefined organic mustard oil', 5, 1, 4, 2, '890103000009', 'SKU-MST-09', 190.00, 265.00, 290.00, 8.0, 15, 30, 8, 80, 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=400&q=80', 1.0, 0, 365],
    [10, 'PRD010', 'Organic Tattva Royal Basmati Rice 1kg', 'Aged extra long grain certified organic fragrant basmati', 5, 1, 2, 2, '890103000010', 'SKU-BAS-10', 145.00, 210.00, 235.00, 10.0, 25, 50, 12, 120, 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80', 1.0, 0, 540],
    [11, 'PRD011', 'Yoga Bar Chocolate Fudge Protein Bar 50g', '20g Whey protein bar with dark cocoa and almond chunks', 6, 6, 1, 4, '890103000011', 'SKU-YGB-11', 62.00, 99.00, 110.00, 10.0, 40, 80, 20, 200, 'https://images.unsplash.com/photo-1622484216802-53b47c94eb5f?auto=format&fit=crop&w=400&q=80', 0.05, 0, 180],
    [12, 'PRD012', 'Artisanal Dark Roast Arabica Coffee 250g', 'Single origin Chikmagalur shade-grown roasted coffee powder', 4, 2, 1, 2, '890103000012', 'SKU-COF-12', 260.00, 395.00, 450.00, 12.0, 15, 30, 6, 60, 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=400&q=80', 0.25, 0, 270],
  ];

  for (const p of products) {
    await db.query(`
      INSERT INTO tbl_Product (
        int_Product_Id, txt_Product_Code, txt_Product_Name, txt_Product_Description,
        int_Category_Id, int_Brand_Id, int_Unit_Id, int_Tax_Id,
        txt_Barcode, txt_SKU, dec_Cost_Price, dec_Selling_Price, dec_MRP,
        dec_Discount_Percentage, int_Reorder_Level, int_Reorder_Quantity,
        int_Minimum_Stock_Level, int_Maximum_Stock_Level, txt_Product_Image_Url,
        dec_Weight, bit_Is_Perishable, int_Shelf_Life_Days,
        bit_Is_Discontinued, bit_Is_Serialized,
        dte_Created_Date, txt_Created_By, dte_Modified_Date, txt_Modified_By, bit_IsActive
      ) VALUES (
        ${p[0]}, '${p[1]}', '${p[2].replace(/'/g, "\\'")}', '${p[3].replace(/'/g, "\\'")}',
        ${p[4]}, ${p[5]}, ${p[6]}, ${p[7]},
        '${p[8]}', '${p[9]}', ${p[10]}, ${p[11]}, ${p[12]},
        ${p[13]}, ${p[14]}, ${p[15]}, ${p[16]}, ${p[17]}, '${p[18]}',
        ${p[19]}, ${p[20]}, ${p[21]},
        0, 0,
        '${now}', 'system', '${now}', 'system', 1
      )
    `);
  }

  // 14. Insert Inventory (tbl_Inventory)
  console.log('📊 Seeding Inventory Records...');
  let invId = 1;
  for (let storeId = 1; storeId <= 3; storeId++) {
    for (let pId = 1; pId <= 12; pId++) {
      const qtyOnHand = Math.floor(Math.random() * 45) + 15;
      await db.query(`
        INSERT INTO tbl_Inventory (
          int_Inventory_Id, int_Product_Id, int_Store_Id, int_Warehouse_Id,
          int_Quantity_On_Hand, int_Quantity_Reserved, int_Quantity_Available,
          int_Quantity_Damaged, txt_Batch_Number, dte_Expiry_Date,
          txt_Bin_Location, dec_Average_Cost_Price, dte_Last_Restocked_Date,
          txt_Storage_Zone, bit_Is_Cycle_Count_Due,
          dte_Created_Date, txt_Created_By, dte_Modified_Date, txt_Modified_By, bit_IsActive
        ) VALUES (
          ${invId++}, ${pId}, ${storeId}, ${storeId === 1 ? 1 : 2},
          ${qtyOnHand}, 0, ${qtyOnHand}, 0, 'BATCH-2026-09',
          '2026-12-31', 'AISLE-0${(pId % 4) + 1}-R${pId}', 50.00, '${now}',
          'Main Storefront', 0,
          '${now}', 'system', '${now}', 'system', 1
        )
      `);
    }
  }

  // 15. Insert Stock Transactions (tbl_Stock_Transaction)
  console.log('📈 Seeding Stock Transactions...');
  let transId = 1;
  for (let pId = 1; pId <= 12; pId++) {
    await db.query(`
      INSERT INTO tbl_Stock_Transaction (
        int_Stock_Transaction_Id, int_Product_Id, int_Store_Id,
        txt_Transaction_Type, int_Quantity, txt_Reference_Number, txt_Reference_Type,
        dec_Unit_Cost, dte_Transaction_Date, int_Performed_By_User_Id,
        txt_Remarks, txt_Source_Location, txt_Destination_Location, dec_Total_Value,
        dte_Created_Date, txt_Created_By, dte_Modified_Date, txt_Modified_By, bit_IsActive
      ) VALUES (
        ${transId++}, ${pId}, 1, 'INWARD', 60, 'INIT-PO-001', 'OPENING_STOCK',
        50.00, '${now}', 1, 'Initial opening stock allocation', 'Warehouse WH001', 'Store Indiranagar', 3000.00,
        '${now}', 'system', '${now}', 'system', 1
      )
    `);
  }

  // 16. Insert Orders, Items, Payments (tbl_Order, tbl_Order_Item, tbl_Payment)
  console.log('🛍️ Seeding Orders & POS Transactions...');
  const orderConfigs = [
    { id: 1, num: 'ORD-2026-0001', cust: 1, user: 2, status: 'COMPLETED', sub: 450.00, disc: 20.00, tax: 22.50, tot: 452.50, type: 'POS', payMethod: 2 },
    { id: 2, num: 'ORD-2026-0002', cust: 2, user: 2, status: 'COMPLETED', sub: 890.00, disc: 50.00, tax: 44.50, tot: 884.50, type: 'ONLINE', payMethod: 3 },
    { id: 3, num: 'ORD-2026-0003', cust: 3, user: 1, status: 'COMPLETED', sub: 1250.00, disc: 100.00, tax: 62.50, tot: 1212.50, type: 'POS', payMethod: 1 },
    { id: 4, num: 'ORD-2026-0004', cust: 5, user: 4, status: 'PROCESSING', sub: 620.00, disc: 0.00, tax: 31.00, tot: 651.00, type: 'ONLINE', payMethod: 2 },
    { id: 5, num: 'ORD-2026-0005', cust: 1, user: 2, status: 'COMPLETED', sub: 340.00, disc: 15.00, tax: 17.00, tot: 342.00, type: 'POS', payMethod: 2 },
  ];

  let orderItemId = 1;
  let paymentId = 1;

  for (const o of orderConfigs) {
    await db.query(`
      INSERT INTO tbl_Order (
        int_Order_Id, txt_Order_Number, int_Store_Id, int_Customer_Id, int_User_Id,
        dte_Order_Date, txt_Order_Type, txt_Order_Status,
        dec_Subtotal_Amount, dec_Discount_Amount, dec_Tax_Amount, dec_Shipping_Amount,
        dec_Total_Amount, dec_Paid_Amount, dec_Due_Amount,
        int_Payment_Method_Id, txt_Payment_Status, txt_Invoice_Number,
        dte_Created_Date, txt_Created_By, dte_Modified_Date, txt_Modified_By, bit_IsActive
      ) VALUES (
        ${o.id}, '${o.num}', 1, ${o.cust}, ${o.user},
        '${now}', '${o.type}', '${o.status}',
        ${o.sub}, ${o.disc}, ${o.tax}, 0.00,
        ${o.tot}, ${o.status === 'COMPLETED' ? o.tot : 0.00}, ${o.status === 'COMPLETED' ? 0.00 : o.tot},
        ${o.payMethod}, '${o.status === 'COMPLETED' ? 'PAID' : 'PENDING'}', 'INV-${o.num}',
        '${now}', 'system', '${now}', 'system', 1
      )
    `);

    // Line items
    await db.query(`
      INSERT INTO tbl_Order_Item (
        int_Order_Item_Id, int_Order_Id, int_Product_Id, int_Quantity,
        dec_Unit_Price, dec_Discount_Percentage, dec_Discount_Amount,
        dec_Tax_Percentage, dec_Tax_Amount, dec_Line_Total,
        bit_Is_Gift, int_Unit_Id, bit_Is_Returned,
        dte_Created_Date, txt_Created_By, dte_Modified_Date, txt_Modified_By, bit_IsActive
      ) VALUES
      (${orderItemId++}, ${o.id}, 1, 2, 68.00, 5.0, 6.80, 5.0, 6.46, 135.66, 0, 4, 0, '${now}', 'system', '${now}', 'system', 1),
      (${orderItemId++}, ${o.id}, 3, 1, 145.00, 0.0, 0.00, 5.0, 7.25, 152.25, 0, 1, 0, '${now}', 'system', '${now}', 'system', 1),
      (${orderItemId++}, ${o.id}, 7, 2, 85.00, 10.0, 17.00, 12.0, 18.36, 171.36, 0, 1, 0, '${now}', 'system', '${now}', 'system', 1)
    `);

    // Payment
    if (o.status === 'COMPLETED') {
      await db.query(`
        INSERT INTO tbl_Payment (
          int_Payment_Id, txt_Payment_Reference_Number, txt_Payment_Source_Type, int_Source_Id,
          int_Payment_Method_Id, dec_Amount, dte_Payment_Date, txt_Payment_Status,
          txt_Transaction_Reference_Number, int_Received_By_User_Id,
          txt_Currency_Code, int_Store_Id, bit_Is_Refund,
          dte_Created_Date, txt_Created_By, dte_Modified_Date, txt_Modified_By, bit_IsActive
        ) VALUES (
          ${paymentId++}, 'PAY-REF-${o.id}', 'ORDER', ${o.id},
          ${o.payMethod}, ${o.tot}, '${now}', 'SUCCESS',
          'TXN-UPI-${100000 + o.id}', ${o.user},
          'INR', 1, 0,
          '${now}', 'system', '${now}', 'system', 1
        )
      `);
    }
  }

  // 17. Insert Purchase Orders (tbl_Purchase_Order, tbl_Purchase_Order_Item)
  console.log('📋 Seeding Purchase Orders...');
  await db.query(`
    INSERT INTO tbl_Purchase_Order (
      int_Purchase_Order_Id, txt_PO_Number, int_Supplier_Id, int_Store_Id,
      int_Warehouse_Id, int_Created_By_User_Id, dte_PO_Date, dte_Expected_Delivery_Date,
      txt_PO_Status, dec_Subtotal_Amount, dec_Tax_Amount, dec_Discount_Amount, dec_Total_Amount,
      txt_Approval_Status, txt_Currency_Code,
      dte_Created_Date, txt_Created_By, dte_Modified_Date, txt_Modified_By, bit_IsActive
    ) VALUES
    (1, 'PO-2026-001', 1, 1, 1, 1, '${now}', '2026-09-25', 'APPROVED', 5200.00, 260.00, 0.00, 5460.00, 'APPROVED', 'INR', '${now}', 'system', '${now}', 'system', 1),
    (2, 'PO-2026-002', 4, 1, 1, 1, '${now}', '2026-09-22', 'DELIVERED', 2850.00, 142.50, 0.00, 2992.50, 'APPROVED', 'INR', '${now}', 'system', '${now}', 'system', 1)
  `);

  await db.query(`
    INSERT INTO tbl_Purchase_Order_Item (
      int_Purchase_Order_Item_Id, int_Purchase_Order_Id, int_Product_Id,
      int_Ordered_Quantity, int_Received_Quantity, dec_Unit_Cost,
      dec_Tax_Percentage, dec_Tax_Amount, dec_Line_Total, txt_Item_Status,
      dte_Created_Date, txt_Created_By, dte_Modified_Date, txt_Modified_By, bit_IsActive
    ) VALUES
    (1, 1, 1, 100, 0, 52.00, 5.0, 260.00, 5460.00, 'PENDING', '${now}', 'system', '${now}', 'system', 1),
    (2, 2, 3, 30, 30, 95.00, 5.0, 142.50, 2992.50, 'RECEIVED', '${now}', 'system', '${now}', 'system', 1)
  `);

  // 18. Insert Goods Receipt (tbl_Goods_Receipt, tbl_Goods_Receipt_Item)
  console.log('📥 Seeding Goods Receipts...');
  await db.query(`
    INSERT INTO tbl_Goods_Receipt (
      int_Goods_Receipt_Id, txt_GRN_Number, int_Purchase_Order_Id, int_Warehouse_Id,
      int_Store_Id, int_Received_By_User_Id, dte_Receipt_Date, txt_Receipt_Status,
      txt_Quality_Check_Status, txt_Remarks,
      dte_Created_Date, txt_Created_By, dte_Modified_Date, txt_Modified_By, bit_IsActive
    ) VALUES
    (1, 'GRN-2026-001', 2, 1, 1, 1, '${now}', 'COMPLETED', 'PASSED', 'Inspected and verified 30 units sourdough bread', '${now}', 'system', '${now}', 'system', 1)
  `);

  await db.query(`
    INSERT INTO tbl_Goods_Receipt_Item (
      int_Goods_Receipt_Item_Id, int_Goods_Receipt_Id, int_Purchase_Order_Item_Id,
      int_Product_Id, int_Received_Quantity, int_Accepted_Quantity, int_Rejected_Quantity,
      txt_Batch_Number, bit_Is_Quality_Passed,
      dte_Created_Date, txt_Created_By, dte_Modified_Date, txt_Modified_By, bit_IsActive
    ) VALUES
    (1, 1, 2, 3, 30, 30, 0, 'BATCH-SRD-SEP', 1, '${now}', 'system', '${now}', 'system', 1)
  `);

  // 19. Insert AI Demand Forecasts (tbl_Demand_Forecast)
  console.log('🤖 Seeding AI Demand Forecasts...');
  for (let pId = 1; pId <= 12; pId++) {
    const forecastedQty = Math.floor(Math.random() * 30) + 20;
    await db.query(`
      INSERT INTO tbl_Demand_Forecast (
        int_Demand_Forecast_Id, int_Product_Id, int_Store_Id, dte_Forecast_Date,
        txt_Forecast_Period_Type, int_Forecasted_Quantity, dec_Confidence_Score,
        txt_Model_Name, txt_Model_Version, dte_Generated_Date,
        dte_Created_Date, txt_Created_By, dte_Modified_Date, txt_Modified_By, bit_IsActive
      ) VALUES (
        ${pId}, ${pId}, 1, '${todayDate}',
        'DAILY', ${forecastedQty}, 0.92,
        'RandomForestRegressor', 'v2.4.1', '${now}',
        '${now}', 'system', '${now}', 'system', 1
      )
    `);
  }

  // 20. Insert AI Stock Risks (tbl_Stock_Risk)
  console.log('⚠️ Seeding AI Stock Risks...');
  await db.query(`
    INSERT INTO tbl_Stock_Risk (
      int_Stock_Risk_Id, int_Product_Id, int_Store_Id, txt_Risk_Type,
      txt_Risk_Level, dec_Risk_Score, int_Days_Until_Stockout,
      int_Current_Stock_Level, int_Predicted_Demand, txt_Recommended_Action,
      dte_Analysis_Date, txt_Model_Name,
      dte_Created_Date, txt_Created_By, dte_Modified_Date, txt_Modified_By, bit_IsActive
    ) VALUES
    (1, 1, 1, 'STOCKOUT_RISK', 'HIGH', 0.88, 2, 8, 35, 'Reorder 50 units immediately from DairyFresh Farms', '${now}', 'InventoryRiskClassifier', '${now}', 'system', '${now}', 'system', 1),
    (2, 3, 1, 'STOCKOUT_RISK', 'HIGH', 0.79, 3, 5, 22, 'Reorder 30 loaves from Sunrise Bakery', '${now}', 'InventoryRiskClassifier', '${now}', 'system', '${now}', 'system', 1),
    (3, 7, 1, 'EXPIRY_RISK', 'MEDIUM', 0.54, 12, 45, 18, 'Apply 15% promotional discount to accelerate sell-through', '${now}', 'InventoryRiskClassifier', '${now}', 'system', '${now}', 'system', 1)
  `);

  // 21. Insert AI Recommendations (tbl_AI_Recommendation)
  console.log('💡 Seeding AI Recommendations...');
  await db.query(`
    INSERT INTO tbl_AI_Recommendation (
      int_AI_Recommendation_Id, txt_Recommendation_Type, int_Product_Id,
      int_Customer_Id, int_Store_Id, txt_Recommendation_Text,
      dec_Confidence_Score, txt_Recommendation_Status, dte_Generated_Date,
      txt_Model_Name, dec_Expected_Revenue_Impact,
      dte_Created_Date, txt_Created_By, dte_Modified_Date, txt_Modified_By, bit_IsActive
    ) VALUES
    (1, 'CROSS_SELL', 2, 1, 1, 'Frequently bought together with Organic Whole Milk', 0.94, 'ACTIVE', '${now}', 'AprioriCollaborativeFiltering', 450.00, '${now}', 'system', '${now}', 'system', 1),
    (2, 'SMART_DISCOUNT', 7, NULL, 1, 'Apply 12% discount to boost afternoon orange juice sales', 0.89, 'ACTIVE', '${now}', 'DiscountOptimizerModel', 1200.00, '${now}', 'system', '${now}', 'system', 1),
    (3, 'REORDER_TRIGGER', 1, NULL, 1, 'Auto-generate PO for 50 units of Fresh Whole Milk', 0.96, 'ACTIVE', '${now}', 'AutomatedReorderEngine', 3400.00, '${now}', 'system', '${now}', 'system', 1)
  `);

  // 22. Insert Customer Segments (tbl_Customer_Segment)
  console.log('👥 Seeding Customer Segments...');
  await db.query(`
    INSERT INTO tbl_Customer_Segment (
      int_Customer_Segment_Id, int_Customer_Id, txt_Segment_Name,
      txt_Segment_Description, dec_RFM_Recency_Score, dec_RFM_Frequency_Score,
      dec_RFM_Monetary_Score, dec_Churn_Probability, dec_Lifetime_Value,
      dte_Segment_Assigned_Date, txt_Model_Name, txt_Recommended_Campaign,
      txt_Segment_Color_Code, bit_Is_Current,
      dte_Created_Date, txt_Created_By, dte_Modified_Date, txt_Modified_By, bit_IsActive
    ) VALUES
    (1, 1, 'Champions (Loyal VIPs)', 'High spenders shopping 3+ times weekly with zero churn risk', 5.0, 5.0, 4.8, 0.04, 38000.00, '${now}', 'KMeansCustomerSegmentation', 'Exclusive early morning farm-fresh tasting invites', '#10B981', 1, '${now}', 'system', '${now}', 'system', 1),
    (2, 2, 'Potential Loyalists', 'Frequent buyers of medium basket sizes with high growth potential', 4.0, 3.5, 3.0, 0.15, 14000.00, '${now}', 'KMeansCustomerSegmentation', 'Weekend breakfast bundle combos via WhatsApp', '#3B82F6', 1, '${now}', 'system', '${now}', 'system', 1),
    (3, 3, 'High Value Champions', 'Top-tier VIP customer with largest historical gross volume', 5.0, 4.8, 5.0, 0.02, 75000.00, '${now}', 'KMeansCustomerSegmentation', 'Dedicated concierge delivery and anniversary gifts', '#8B5CF6', 1, '${now}', 'system', '${now}', 'system', 1),
    (4, 4, 'At Risk / Need Attention', 'Customers with declining visitation over last 45 days', 2.0, 1.5, 2.0, 0.62, 5200.00, '${now}', 'KMeansCustomerSegmentation', 'Win-back 20% discount offer code', '#EF4444', 1, '${now}', 'system', '${now}', 'system', 1),
    (5, 5, 'Loyal Customers', 'Consistent weekly buyers with strong category retention', 4.5, 4.0, 4.2, 0.08, 29000.00, '${now}', 'KMeansCustomerSegmentation', 'Double Smart Coins loyalty reward weekend', '#F59E0B', 1, '${now}', 'system', '${now}', 'system', 1)
  `);

  // 23. Insert Anomaly Logs (tbl_Anomaly_Log)
  console.log('🔍 Seeding Anomaly Logs...');
  await db.query(`
    INSERT INTO tbl_Anomaly_Log (
      int_Anomaly_Log_Id, txt_Anomaly_Type, txt_Entity_Type, int_Entity_Id,
      int_Store_Id, dec_Anomaly_Score, txt_Severity_Level, txt_Description,
      txt_Detection_Status, dte_Detected_Date, txt_Model_Name,
      dte_Created_Date, txt_Created_By, dte_Modified_Date, txt_Modified_By, bit_IsActive
    ) VALUES
    (1, 'SUDDEN_DEMAND_SURGE', 'PRODUCT', 7, 1, 0.89, 'MEDIUM', 'Juice sales spiked 340% above 30-day baseline over last 4 hours', 'INVESTIGATING', '${now}', 'IsolationForestAnomalyDetector', '${now}', 'system', '${now}', 'system', 1),
    (2, 'PRICE_DISCREPANCY_ALERT', 'PRODUCT', 12, 1, 0.72, 'LOW', 'Discount configuration exceeds approved margin buffer by 2%', 'RESOLVED', '${now}', 'RuleBasedAuditor', '${now}', 'system', '${now}', 'system', 1)
  `);

  // 24. Insert Model Performance Metrics (tbl_Model_Performance)
  console.log('📈 Seeding ML Model Performance Metrics...');
  const models = [
    [1, 'DemandForecaster', 'REGRESSION', 'v2.4.1', 0.94, 0.92, 0.91, 0.91, 3.42, 'Production - Online Daily'],
    [2, 'InventoryRiskClassifier', 'CLASSIFICATION', 'v1.8.0', 0.96, 0.95, 0.94, 0.94, 0.12, 'Production - Realtime Event'],
    [3, 'KMeansCustomerSegmentation', 'CLUSTERING', 'v3.1.0', 0.91, 0.89, 0.90, 0.89, 0.45, 'Production - Weekly Batch'],
    [4, 'AprioriCollaborativeFiltering', 'RECOMMENDATION', 'v2.0.2', 0.93, 0.91, 0.92, 0.91, 0.28, 'Production - POS Realtime'],
    [5, 'IsolationForestAnomalyDetector', 'ANOMALY_DETECTION', 'v1.5.0', 0.95, 0.93, 0.94, 0.93, 0.15, 'Production - Stream Processor'],
    [6, 'SmartDiscountOptimizer', 'OPTIMIZATION', 'v2.1.0', 0.92, 0.90, 0.91, 0.90, 0.35, 'Production - Daily Dynamic Pricing']
  ];

  for (const m of models) {
    await db.query(`
      INSERT INTO tbl_Model_Performance (
        int_Model_Performance_Id, txt_Model_Name, txt_Model_Type, txt_Model_Version,
        dec_Accuracy, dec_Precision_Score, dec_Recall_Score, dec_F1_Score, dec_RMSE,
        dte_Training_Date, dte_Evaluation_Date, txt_Deployment_Status,
        txt_Training_Data_Size, txt_Deployed_By,
        dte_Created_Date, txt_Created_By, dte_Modified_Date, txt_Modified_By, bit_IsActive
      ) VALUES (
        ${m[0]}, '${m[1]}', '${m[2]}', '${m[3]}',
        ${m[4]}, ${m[5]}, ${m[6]}, ${m[7]}, ${m[8]},
        '${now}', '${now}', '${m[9]}',
        '150,000 POS records', 'RetailMind ML Ops',
        '${now}', 'system', '${now}', 'system', 1
      )
    `);
  }

  // 25. Insert Notifications (tbl_Notification)
  console.log('🔔 Seeding System Notifications...');
  await db.query(`
    INSERT INTO tbl_Notification (
      int_Notification_Id, int_User_Id, txt_Notification_Type, txt_Title, txt_Message,
      txt_Priority_Level, bit_Is_Read, txt_Channel, txt_Delivery_Status,
      txt_Action_Url, int_Store_Id, dte_Sent_Date,
      dte_Created_Date, txt_Created_By, dte_Modified_Date, txt_Modified_By, bit_IsActive
    ) VALUES
    (1, 1, 'LOW_STOCK', 'Low Stock Alert: Fresh Organic Whole Milk', 'Current stock (8 units) has breached the reorder threshold of 30 units.', 'CRITICAL', 0, 'In-App', 'Delivered', '/inventory', 1, '${now}', '${now}', 'system', '${now}', 'system', 1),
    (2, 1, 'HIGH_STOCK_RISK', 'High Stockout Risk: Epigamia Greek Yogurt', 'Predicted stockout in ~2 days based on current velocity.', 'HIGH', 0, 'In-App', 'Delivered', '/purchase-orders', 1, '${now}', '${now}', 'system', '${now}', 'system', 1),
    (3, 3, 'CUSTOMER_OFFER', 'Exclusive Deal: 15% OFF on Dairy & Bakery', 'Special recommendation based on your shopping frequency. Use code FRESH15!', 'NORMAL', 0, 'WhatsApp', 'Delivered', '/shop/offers', 1, '${now}', '${now}', 'system', '${now}', 'system', 1)
  `);

  // 26. Insert Settings (tbl_Settings)
  console.log('⚙️ Seeding System Settings...');
  const settings = [
    [1, 'store_name', 'RetailMind AI Supermarket', 'RetailMind AI Supermarket', 'General', 'Primary business name displayed on invoices and UI'],
    [2, 'currency', 'INR (₹)', 'INR (₹)', 'General', 'System currency code and display symbol'],
    [3, 'tax_rate_default', '5.0', '5.0', 'Taxation', 'Default essential GST rate in percent'],
    [4, 'low_stock_threshold', '20', '20', 'Inventory', 'Global safety stock alert threshold'],
    [5, 'loyalty_points_multiplier', '0.05', '0.05', 'Loyalty', 'Smart coins earned per rupee spent (5%)'],
    [6, 'enable_ai_reorder', 'true', 'true', 'AI Automation', 'Enables automated PO draft generation from ML forecasts'],
    [7, 'whatsapp_offers_enabled', 'true', 'true', 'Marketing', 'Enable automated WhatsApp campaign triggers'],
    [8, 'smart_discount_max_pct', '25', '25', 'Pricing', 'Maximum dynamic discount percentage allowed by ML engine'],
  ];

  for (const s of settings) {
    await db.query(`
      INSERT INTO tbl_Settings (
        int_Setting_Id, txt_Setting_Key, txt_Setting_Value, txt_Default_Value,
        txt_Setting_Category, txt_Setting_Description, bit_Is_Editable, bit_Is_Global,
        bit_Requires_Restart,
        dte_Created_Date, txt_Created_By, dte_Modified_Date, txt_Modified_By, bit_IsActive
      ) VALUES (
        ${s[0]}, '${s[1]}', '${s[2]}', '${s[3]}',
        '${s[4]}', '${s[5]}', 1, 1, 0,
        '${now}', 'system', '${now}', 'system', 1
      )
    `);
  }

  // 27. Re-enable Foreign Key Checks
  await db.query('SET FOREIGN_KEY_CHECKS = 1');

  console.log('\n====================================================');
  console.log('✅ ALL 37 RELATIONAL TABLES SUCCESSFULLY SEEDED!');
  console.log('====================================================\n');
  console.log('Credentials Summary:');
  console.log('👑 Admin:     admin@retailmind.ai    / password123');
  console.log('🏪 Seller:    seller@retailmind.ai   / password123');
  console.log('🛒 Customer:  customer@retailmind.ai / password123\n');
}

if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Seeding failed:', err);
      process.exit(1);
    });
}

module.exports = seedDatabase;
