const http = require('http');
const app = require('../backend/src/app');
const { pool } = require('../backend/src/config/db');
const { generateToken } = require('../backend/src/utils/jwt');

async function testBusinessFlow() {
  console.log('================================================================');
  console.log('🔍 RETAILMIND AI — COMPREHENSIVE BUSINESS WORKFLOW AUDIT');
  console.log('================================================================\n');

  // Start test server
  const server = http.createServer(app);
  await new Promise(r => server.listen(5098, r));
  console.log('✅ Test server started on port 5098\n');

  const req = (method, path, body = null, token = null) => {
    return new Promise((resolve, reject) => {
      const postData = body ? JSON.stringify(body) : null;
      const headers = {
        'Content-Type': 'application/json',
        ...(postData ? { 'Content-Length': Buffer.byteLength(postData) } : {}),
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      };

      const request = http.request({
        hostname: '127.0.0.1',
        port: 5098,
        path: `/api${path}`,
        method: method.toUpperCase(),
        headers,
      }, (res) => {
        let raw = '';
        res.on('data', chunk => raw += chunk);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(raw);
            resolve({ status: res.statusCode, body: parsed });
          } catch (e) {
            resolve({ status: res.statusCode, raw });
          }
        });
      });

      request.on('error', reject);
      if (postData) request.write(postData);
      request.end();
    });
  };

  try {
    // 1. Roles & Tokens
    console.log('--- 1. Testing Role Logins & JWT Generation ---');
    const adminToken = generateToken({
      id: '1',
      userId: 1,
      email: 'admin@retailmind.ai',
      name: 'Admin User',
      role: 'ADMIN',
      storeId: 'store-01',
      store: 'Indiranagar Flagship (Store 01)',
      permissions: ['ALL'],
    });

    const sellerToken = generateToken({
      id: '2',
      userId: 2,
      email: 'seller@retailmind.ai',
      name: 'Sarah Khan',
      role: 'SELLER',
      storeId: 'store-01',
      store: 'Indiranagar Flagship (Store 01)',
      permissions: ['POS', 'INVENTORY', 'SALES'],
    });

    const customerToken = generateToken({
      id: '3',
      userId: 3,
      email: 'customer@retailmind.ai',
      name: 'Priya Sharma',
      role: 'CUSTOMER',
      storeId: 'store-01',
      store: 'Indiranagar Flagship (Store 01)',
      permissions: ['SHOP'],
    });

    // 2. Admin Flow: Check Master Data
    console.log('\n--- 2. Testing Admin Master Data Retrieval ---');
    const productsRes = await req('GET', '/products', null, adminToken);
    console.log(`Products status: ${productsRes.status}, count: ${productsRes.body?.data?.length || productsRes.body?.data?.products?.length || 0}`);
    
    const storesRes = await req('GET', '/stores', null, adminToken);
    console.log(`Stores status: ${storesRes.status}, count: ${storesRes.body?.data?.length || 0}`);

    const suppliersRes = await req('GET', '/suppliers', null, adminToken);
    console.log(`Suppliers status: ${suppliersRes.status}, count: ${suppliersRes.body?.data?.length || 0}`);

    // 3. Store Manager / Seller Flow: Check Store Inventory
    console.log('\n--- 3. Testing Store Manager / Seller Store Inventory ---');
    const invRes = await req('GET', '/inventory?storeId=store-01', null, sellerToken);
    console.log(`Store 01 Inventory status: ${invRes.status}, count: ${invRes.body?.data?.length || 0}`);

    // Check Product 1 initial stock in DB
    const [invRowBefore] = await pool.query('SELECT int_Quantity_On_Hand FROM tbl_Inventory WHERE int_Product_Id = 1 AND int_Store_Id = 1');
    console.log(`Initial DB Stock for Product 1 in Store 1: ${invRowBefore[0]?.int_Quantity_On_Hand}`);

    // 4. Customer Purchase Flow
    console.log('\n--- 4. Testing Customer Order Creation (Purchase 2 units of Product 1) ---');
    const orderPayload = {
      items: [
        {
          productId: 'prod-001',
          id: 1,
          quantity: 2,
          price: 68,
          originalPrice: 72,
          name: 'Fresh Organic Whole Milk 1L',
        }
      ],
      paymentMethod: 'UPI',
      deliveryAddress: 'Flat 402, Palm Heights, Indiranagar, Bangalore - 560038',
      store: 'Indiranagar Flagship (Store 01)',
    };
    const orderRes = await req('POST', '/orders', orderPayload, customerToken);
    console.log(`Customer Order status: ${orderRes.status}, response:`, orderRes.body?.success, orderRes.body?.data?.orderNumber || orderRes.body?.data?.txt_Order_Number || orderRes.body?.message);
    const orderId = orderRes.body?.data?.id || orderRes.body?.data?._id || orderRes.body?.data?.int_Order_Id;
    const orderNum = orderRes.body?.data?.orderNumber || orderRes.body?.data?.txt_Order_Number;

    // 5. Verify Database Records for Order, Item, Payment, Inventory, StockTransaction
    console.log('\n--- 5. Verifying DB After Customer Purchase ---');
    const [invRowAfter] = await pool.query('SELECT int_Quantity_On_Hand FROM tbl_Inventory WHERE int_Product_Id = 1 AND int_Store_Id = 1');
    console.log(`Updated DB Stock for Product 1 in Store 1: ${invRowAfter[0]?.int_Quantity_On_Hand} (Reduced by 2: ${invRowBefore[0]?.int_Quantity_On_Hand - invRowAfter[0]?.int_Quantity_On_Hand === 2})`);

    const [dbOrder] = await pool.query('SELECT * FROM tbl_Order WHERE int_Order_Id = ?', [orderId]);
    console.log(`tbl_Order created: ID ${dbOrder[0]?.int_Order_Id}, Num: ${dbOrder[0]?.txt_Order_Number}, Total: ₹${dbOrder[0]?.dec_Total_Amount}, Status: ${dbOrder[0]?.txt_Order_Status}`);

    const [dbItems] = await pool.query('SELECT * FROM tbl_Order_Item WHERE int_Order_Id = ?', [orderId]);
    console.log(`tbl_Order_Item count: ${dbItems.length}, Product: ${dbItems[0]?.int_Product_Id}, Qty: ${dbItems[0]?.int_Quantity}`);

    const [dbPayment] = await pool.query('SELECT * FROM tbl_Payment WHERE int_Order_Id = ?', [orderId]);
    console.log(`tbl_Payment created: ID ${dbPayment[0]?.int_Payment_Id}, Amount: ₹${dbPayment[0]?.dec_Amount}, Status: ${dbPayment[0]?.txt_Payment_Status}`);

    const [dbTxn] = await pool.query('SELECT * FROM tbl_Stock_Transaction WHERE int_Reference_Id = ? OR txt_Reference_Number = ?', [orderId, orderNum]);
    console.log(`tbl_Stock_Transaction count: ${dbTxn.length}, Type: ${dbTxn[0]?.txt_Transaction_Type}, Qty: ${dbTxn[0]?.int_Quantity}`);

    // 6. Store Manager & Sales Visibility
    console.log('\n--- 6. Testing Store Manager / Sales Executive Order Visibility ---');
    const managerOrdersRes = await req('GET', `/orders?storeId=store-01`, null, sellerToken);
    console.log(`Manager Orders status: ${managerOrdersRes.status}, count: ${managerOrdersRes.body?.data?.length || 0}`);
    const foundOrder = (managerOrdersRes.body?.data || []).find(o => o.orderNumber === orderNum || String(o.id) === String(orderId));
    console.log(`Manager sees newly placed order: ${Boolean(foundOrder)}`);

    // 7. Order Lifecycle Transitions
    console.log('\n--- 7. Testing Order Lifecycle (Processing -> Shipped -> Delivered) ---');
    const shipRes = await req('PATCH', `/orders/${orderId}/status`, { status: 'Shipped' }, sellerToken);
    console.log(`Status Shipped update: ${shipRes.status}, current status: ${shipRes.body?.data?.status}`);

    const deliverRes = await req('PATCH', `/orders/${orderId}/status`, { status: 'Delivered' }, sellerToken);
    console.log(`Status Delivered update: ${deliverRes.status}, current status: ${deliverRes.body?.data?.status}`);

    // 8. AI Reorder & Demand Intelligence
    console.log('\n--- 8. Testing AI Reorder & Demand Intelligence ---');
    const reorderRes = await req('GET', '/ai/reorder', null, adminToken);
    console.log(`AI Reorder Recommendations status: ${reorderRes.status}, count: ${reorderRes.body?.data?.length || 0}`);
    if (reorderRes.body?.data?.length > 0) {
      console.log('Sample Reorder Recommendation:', JSON.stringify(reorderRes.body.data[0], null, 2));
    }

    // 9. Purchase Order & Supplier Replenishment Loop
    console.log('\n--- 9. Testing Supplier PO Creation & Goods Receipt Loop ---');
    const poPayload = {
      supplierId: 1,
      items: [
        {
          productId: 'prod-001',
          id: 1,
          quantity: 20,
          unitCost: 52,
          total: 1040,
        }
      ],
      paymentTerms: 'Net 30',
      expectedDelivery: new Date(Date.now() + 3 * 86400000).toISOString(),
    };
    const poRes = await req('POST', '/purchase-orders', poPayload, adminToken);
    console.log(`PO Creation status: ${poRes.status}, PO Number: ${poRes.body?.data?.poNumber || poRes.body?.data?.txt_PO_Number}`);
    const poId = poRes.body?.data?.id || poRes.body?.data?._id || poRes.body?.data?.int_Purchase_Order_Id;

    const [stockBeforeReceipt] = await pool.query('SELECT int_Quantity_On_Hand FROM tbl_Inventory WHERE int_Product_Id = 1 AND int_Store_Id = 1');
    console.log(`Stock before PO receipt: ${stockBeforeReceipt[0]?.int_Quantity_On_Hand}`);

    // Transition PO to Delivered (triggers Goods Receipt and Stock increment)
    const poDeliveredRes = await req('PATCH', `/purchase-orders/${poId}/status`, { status: 'Delivered' }, adminToken);
    console.log(`PO Delivered status: ${poDeliveredRes.status}, current status: ${poDeliveredRes.body?.data?.status}`);

    const [stockAfterReceipt] = await pool.query('SELECT int_Quantity_On_Hand FROM tbl_Inventory WHERE int_Product_Id = 1 AND int_Store_Id = 1');
    console.log(`Stock after PO receipt: ${stockAfterReceipt[0]?.int_Quantity_On_Hand} (Increased by 20: ${stockAfterReceipt[0]?.int_Quantity_On_Hand - stockBeforeReceipt[0]?.int_Quantity_On_Hand === 20})`);

    const [grnRow] = await pool.query('SELECT * FROM tbl_Goods_Receipt WHERE int_Purchase_Order_Id = ?', [poId]);
    console.log(`tbl_Goods_Receipt record: ID ${grnRow[0]?.int_Goods_Receipt_Id}, GRN: ${grnRow[0]?.txt_GRN_Number}`);

    const [poTxn] = await pool.query('SELECT * FROM tbl_Stock_Transaction WHERE int_Reference_Id = ? AND txt_Transaction_Type = "PURCHASE"', [poId]);
    console.log(`tbl_Stock_Transaction record for Restock: ID ${poTxn[0]?.int_Stock_Transaction_Id}, Qty: ${poTxn[0]?.int_Quantity}`);

    // 10. AI Chat Assistant Integration Check
    console.log('\n--- 10. Testing AI Chat Assistant Cross-Role Integration ---');
    const adminChat = await req('POST', '/ai/chat', { message: 'What is our current revenue and top selling products?' }, adminToken);
    console.log(`Admin AI Chat status: ${adminChat.status}, response length: ${adminChat.body?.data?.message?.length || 0}`);

    const sellerChat = await req('POST', '/ai/chat', { message: 'Which items are low in stock in Store 1?' }, sellerToken);
    console.log(`Seller AI Chat status: ${sellerChat.status}, response length: ${sellerChat.body?.data?.message?.length || 0}`);

    const custChat = await req('POST', '/ai/chat', { message: 'What deals do you have on organic milk and dairy?' }, customerToken);
    console.log(`Customer AI Chat status: ${custChat.status}, response length: ${custChat.body?.data?.message?.length || 0}`);

    console.log('\n================================================================');
    console.log('🎉 AUDIT COMPLETE — ALL CORE WORKFLOW STAGES EXECUTED');
    console.log('================================================================\n');
  } catch (err) {
    console.error('❌ Audit Failed:', err);
  } finally {
    server.close();
    await pool.end();
  }
}

testBusinessFlow();
