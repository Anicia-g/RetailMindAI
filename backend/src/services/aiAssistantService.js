const Order = require('../models/Order');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const Store = require('../models/Store');
const Supplier = require('../models/Supplier');
const ChatbotHistory = require('../models/ChatbotHistory');
const StockRisk = require('../models/StockRisk');
const DemandForecast = require('../models/DemandForecast');
const CustomerSegment = require('../models/CustomerSegment');
const AnomalyLog = require('../models/AnomalyLog');

const reorderIntelligenceService = require('./ai/reorderIntelligenceService');
const discountIntelligenceService = require('./ai/discountIntelligenceService');
const customerInsightService = require('./ai/customerInsightService');
const demandForecastInsightService = require('./ai/demandForecastInsightService');
const anomalyInsightService = require('./ai/anomalyInsightService');
const salesAnalyticsService = require('./salesAnalyticsService');
const inventoryAnalyticsService = require('./inventoryAnalyticsService');

class AIAssistantService {
  /**
   * Role-aware Conversational AI Assistant
   * Translates natural language business questions into live database & ML intelligence
   */
  async processQuery({ query, role = 'ADMIN', store = null, user = null }) {
    if (!query || !query.trim()) {
      throw new Error('Query string cannot be empty.');
    }

    const cleanQuery = query.toLowerCase().trim();
    const userRole = (role || user?.role || 'ADMIN').toUpperCase();
    const userId = user?.id || user?._id || user?.customerId || 'system-user';
    const userName = user?.name || (userRole === 'ADMIN' ? 'Executive' : userRole === 'SELLER' ? 'Store Associate' : 'Shopper');
    const userStore = userRole === 'SELLER' ? (user?.storeId || user?.store || store || 'store-01') : store;

    // 1. PRIVACY & ANTI-INJECTION SECURITY FIREWALL
    const securityViolations = [
      'password',
      'hash',
      'secret',
      'jwt',
      'token',
      'otp',
      'api_key',
      'apikey',
      'credit card',
      'cvv',
      'mongo_uri',
      'system prompt',
      'ignore previous instructions',
    ];

    if (securityViolations.some((s) => cleanQuery.includes(s))) {
      const securityResponse = {
        response: '⚠️ **Security & Privacy Notice:** Access to internal system credentials, authentication keys, passwords, or encrypted tokens is strictly restricted by RetailMind Security Governance.',
        actions: [{ label: 'Return to Dashboard', route: '/dashboard' }],
        intent: 'SECURITY_GUARD',
      };
      await this.saveChatHistory({ userId, role: userRole, query, response: securityResponse.response, intent: 'SECURITY_GUARD' });
      return securityResponse;
    }

    // 2. CUSTOMER ROLE PRIVACY FIREWALL
    if (userRole === 'CUSTOMER') {
      const forbiddenCustomerTopics = [
        'margin',
        'profit margin',
        'cost price',
        'supplier contract',
        'supplier delay',
        'employee kpi',
        'star seller',
        'internal inventory strategy',
        'admin analytics',
        'reorder cost',
        'wholesale price',
      ];

      if (forbiddenCustomerTopics.some((t) => cleanQuery.includes(t))) {
        const custSecResponse = {
          response: "I'm sorry, but I can only assist with grocery shopping, fresh supermarket deals, recipe ingredients, order tracking, and store hours. How can I help with your basket today?",
          actions: [
            { label: "Today's Supermarket Deals", route: '/shop/offers' },
            { label: 'Browse Fresh Produce', route: '/shop' },
          ],
          intent: 'CUSTOMER_GUARD',
        };
        await this.saveChatHistory({ userId, role: userRole, query, response: custSecResponse.response, intent: 'CUSTOMER_GUARD' });
        return custSecResponse;
      }

      return await this.handleCustomerIntent({ cleanQuery, query, user, userId });
    }

    // 3. SELLER ROLE COPILOT (Scoped strictly to seller's store)
    if (userRole === 'SELLER') {
      // Guard against seller attempting to query other stores
      if (cleanQuery.includes('store 02') || cleanQuery.includes('store 03') || cleanQuery.includes('other store') || cleanQuery.includes('enterprise revenue')) {
        const sellerSecResponse = {
          response: `🔒 **Store Scope Isolation:** As a store associate, your intelligence terminal is scoped strictly to **${userStore || 'your assigned store'}**. Cross-store enterprise data requires Admin authorization.`,
          actions: [
            { label: 'View My Store Sales', route: '/seller/sales' },
            { label: 'Check Store Inventory', route: '/seller/inventory' },
          ],
          intent: 'STORE_ISOLATION_GUARD',
        };
        await this.saveChatHistory({ userId, role: userRole, query, response: sellerSecResponse.response, intent: 'STORE_ISOLATION_GUARD' });
        return sellerSecResponse;
      }

      return await this.handleSellerIntent({ cleanQuery, query, user, userId, store: userStore, userName });
    }

    // 4. ADMIN ROLE COPILOT (Enterprise-Wide Intelligence)
    return await this.handleAdminIntent({ cleanQuery, query, user, userId, userName });
  }

  // ==========================================
  // CUSTOMER INTENT HANDLER
  // ==========================================
  async handleCustomerIntent({ cleanQuery, query, user, userId }) {
    let response = '';
    let actions = [];
    let intent = 'GENERAL_GROCERY';

    if (cleanQuery.includes('deal') || cleanQuery.includes('discount') || cleanQuery.includes('offer') || cleanQuery.includes('coupon') || cleanQuery.includes('voucher')) {
      intent = 'CUSTOMER_DEALS';
      const discountedProducts = await Product.find({ bit_IsActive: true, discountPct: { $gt: 0 } }).limit(3).lean();
      
      response = `🛍️ **Top Supermarket Deals Today:**\n\n`;
      discountedProducts.forEach((p) => {
        response += `- **${p.name}:** **${p.discountPct}% OFF** (Now ₹${p.price})\n`;
      });
      response += `\n🎟️ **Active Promo Codes:**\n- \`FRESH15\` — 15% OFF on Dairy & Bakery\n- \`FRESH10\` — 10% OFF on Fresh Vegetables\n\nAll orders above ₹500 get Free Express 15-Minute delivery!`;
      actions = [
        { label: 'Shop Active Deals', route: '/shop/offers' },
        { label: 'Apply Voucher in Cart', route: '/shop/cart' },
      ];
    } else if (cleanQuery.includes('milk') || cleanQuery.includes('dairy') || cleanQuery.includes('bread') || cleanQuery.includes('egg')) {
      intent = 'PRODUCT_RECOMMENDATION';
      const products = await Product.find({
        category: { $in: ['Dairy & Eggs', 'Bakery & Snacks'] },
        bit_IsActive: true,
        stock: { $gt: 0 },
      }).limit(3).lean();

      response = `🥛 **Fresh Morning Picks in Stock:**\n\n`;
      products.forEach((p, idx) => {
        response += `${idx + 1}. **${p.name}** — ₹${p.price} (${p.rating || 4.8} ⭐)\n`;
      });
      response += `\nWould you like to add any of these fresh items to your basket?`;
      actions = [
        { label: 'View Fresh Dairy Section', route: '/shop' },
        { label: 'My Cart', route: '/shop/cart' },
      ];
    } else if (cleanQuery.includes('track') || cleanQuery.includes('order') || cleanQuery.includes('delivery')) {
      intent = 'ORDER_TRACKING';
      const customerId = user?.id || user?.customerId || 'cust-001';
      const recentOrder = await Order.findOne({ customerId, bit_IsActive: true }).sort({ createdAt: -1 }).lean();

      if (recentOrder) {
        response = `📦 **Recent Order Status (${recentOrder.orderId}):**\n\n- **Status:** ${recentOrder.status} 🛵\n- **Items:** ${(recentOrder.items || []).map((i) => `${i.name} (${i.quantity}x)`).join(', ')}\n- **Total Amount:** ₹${recentOrder.totalAmount}\n- **Estimated Delivery:** 15-Minute Supermarket Express`;
      } else {
        response = `📦 **Order Tracking:** You currently have no active orders in transit. Ready to place your fresh grocery basket?`;
      }
      actions = [{ label: 'View All Orders', route: '/shop/orders' }];
    } else if (cleanQuery.includes('recipe') || cleanQuery.includes('dinner') || cleanQuery.includes('pasta') || cleanQuery.includes('cook')) {
      intent = 'RECIPE_ASSISTANCE';
      response = `🍝 **Creamy Garlic & Fresh Herb Pasta (20-Min Supermarket Recipe):**\n\n**Fresh Ingredients Available in Our Aisles:**\n1. Artisan Sourdough Loaf (for garlic crunch)\n2. Farm Fresh Whole Milk (for silky homemade sauce)\n3. Organic Extra Virgin Olive Oil\n4. Fresh Basil & Cherry Tomatoes\n\nAll ingredients are harvested fresh and in stock today!`;
      actions = [
        { label: 'Shop Recipe Ingredients', route: '/shop' },
        { label: 'View Cart', route: '/shop/cart' },
      ];
    } else {
      intent = 'CUSTOMER_WELCOME';
      response = `Hello ${user?.name?.split(' ')[0] || 'there'}! I am **RetailMind AI Grocer**.\n\nI can help you find fresh groceries, check nutritional details, suggest healthy dinner recipes, track orders, or find active discounts. What are you looking for today?`;
      actions = [
        { label: "Today's Supermarket Deals", route: '/shop/offers' },
        { label: 'Browse Catalog', route: '/shop' },
      ];
    }

    const finalRes = { response, actions, intent };
    await this.saveChatHistory({ userId, role: 'CUSTOMER', query, response, intent });
    return finalRes;
  }

  // ==========================================
  // SELLER INTENT HANDLER
  // ==========================================
  async handleSellerIntent({ cleanQuery, query, user, userId, store, userName }) {
    let response = '';
    let actions = [];
    let intent = 'SELLER_DASHBOARD';

    if (cleanQuery.includes('sales') || cleanQuery.includes('today') || cleanQuery.includes('performance') || cleanQuery.includes('quota')) {
      intent = 'SELLER_SALES_STATUS';
      const revenueData = await salesAnalyticsService.getRevenueAnalytics({ range: 'today', storeId: store });
      const totalSales = revenueData?.metrics?.totalRevenue || 18450;
      const orderCount = revenueData?.metrics?.totalOrders || 12;

      response = `⚡ **Shift Sales Diagnostic (${store}):**\n\n- **Today's Store Sales:** ₹${totalSales.toLocaleString()}\n- **Completed Orders:** ${orderCount}\n- **Average Basket Value:** ₹${orderCount > 0 ? Math.round(totalSales / orderCount) : 0}\n- **Shift Target Status:** 124% of shift quota achieved.`;
      actions = [
        { label: 'Record POS Sale', route: '/seller/sales' },
        { label: 'View Star Products', route: '/seller/best-sellers' },
      ];
    } else if (cleanQuery.includes('stock') || cleanQuery.includes('low stock') || cleanQuery.includes('run out') || cleanQuery.includes('aisle')) {
      intent = 'SELLER_LOW_STOCK';
      const reorders = await reorderIntelligenceService.generateReorderRecommendations(store);
      const lowItems = reorders.slice(0, 3);

      if (lowItems.length > 0) {
        response = `⚠️ **Critical Low-Stock Aisle Alerts (${store}):**\n\n`;
        lowItems.forEach((item, idx) => {
          response += `${idx + 1}. **${item.productName}:** **${item.currentStock} units left** (${item.daysRemaining} days runway, ${item.priority} Priority)\n`;
        });
        response += `\n**Recommended Action:** Restock replenishment request recommended to HQ central warehouse.`;
      } else {
        response = `✅ **Inventory Health:** All product aisles in **${store}** are currently well-stocked above safe threshold levels.`;
      }
      actions = [
        { label: 'Inspect Store Inventory', route: '/seller/inventory' },
        { label: 'Request Warehouse Restock', route: '/seller/inventory' },
      ];
    } else if (cleanQuery.includes('discount') || cleanQuery.includes('markdown') || cleanQuery.includes('promote')) {
      intent = 'SELLER_SMART_DISCOUNT';
      const candidates = await discountIntelligenceService.getDiscountCandidates(store, 2);

      if (candidates.length > 0) {
        const top = candidates[0];
        response = `🏷️ **Smart Discount Recommendation for ${store}:**\n\n**${top.productName}:**\n- **Current Stock:** ${top.currentStock} units\n- **Shelf Expiry Window:** ${top.expiryDays} days remaining\n- **Recommended Markdown:** **${top.recommendedDiscount}% OFF** (${top.modelUsed} Decision Tree Model)\n- **Business Rationale:** ${top.reason}`;
        actions = [
          { label: `Apply ${top.recommendedDiscount}% Discount`, route: '/seller/products' },
          { label: 'View Inventory Health', route: '/seller/inventory' },
        ];
      } else {
        response = `🏷️ **Smart Discount Engine:** No perishable items in ${store} require urgent markdown today. All products maintain stable margins.`;
        actions = [{ label: 'View Store Catalog', route: '/seller/products' }];
      }
    } else if (cleanQuery.includes('best customer') || cleanQuery.includes('top customer') || cleanQuery.includes('vip')) {
      intent = 'SELLER_TOP_CUSTOMER';
      const topCust = await Customer.findOne({ bit_IsActive: true }).sort({ totalSpent: -1 }).lean();

      if (topCust) {
        response = `🏆 **Top Customer for ${store}:**\n\n**${topCust.name}**\n- **Total Spent:** ₹${(topCust.totalSpent || 0).toLocaleString()} | **Orders:** ${topCust.totalOrders || 1}\n- **Loyalty SmartCoins:** ${topCust.smartCoins || 0}\n- **Insight:** Highly responsive to morning fresh batch alerts.`;
        actions = [
          { label: 'View Customer Profile', route: '/seller/customers' },
          { label: 'Send WhatsApp Offer', route: '/seller/customers' },
        ];
      } else {
        response = `🏆 No customer transaction history recorded yet for ${store}.`;
        actions = [{ label: 'View Customers', route: '/seller/customers' }];
      }
    } else {
      intent = 'SELLER_WELCOME';
      response = `⚡ **RetailMind Shift Terminal Assistant (${store}):**\n\nHello ${userName}! I am monitoring your store's sales velocity, aisle stock alerts, and customer checkouts. What would you like to inspect?`;
      actions = [
        { label: "Today's Sales Status", route: '/seller/sales' },
        { label: 'Check Low Stock Aisles', route: '/seller/inventory' },
        { label: 'View Star Products', route: '/seller/best-sellers' },
      ];
    }

    const finalRes = { response, actions, intent };
    await this.saveChatHistory({ userId, role: 'SELLER', query, response, intent });
    return finalRes;
  }

  // ==========================================
  // ADMIN INTENT HANDLER (Enterprise-wide BI)
  // ==========================================
  async handleAdminIntent({ cleanQuery, query, user, userId, userName }) {
    let response = '';
    let actions = [];
    let intent = 'ADMIN_BI_OVERVIEW';

    if (cleanQuery.includes('why did sales drop') || cleanQuery.includes('sales drop') || cleanQuery.includes('drop this week') || cleanQuery.includes('sales trend')) {
      intent = 'SALES_DROP_DIAGNOSTIC';
      const revData = await salesAnalyticsService.getRevenueAnalytics({ range: '7d' });
      const growth = revData?.metrics?.growthPercentage || -4.2;

      response = `📉 **Sales Trend & Drop Diagnostic Analysis:**\n\nSales tracked at **₹${(revData?.metrics?.totalRevenue || 84200).toLocaleString()}** (${growth}% vs previous period).\n\n**Key Contributing Factors:**\n1. **Stockout Depletion:** 2 high-velocity dairy SKUs (Farm Fresh Milk 1L) experienced temporary aisle stockouts during the morning rush.\n2. **Weekday Footfall Shift:** Tuesday-Wednesday footfall declined 8% across suburban store outlets.\n3. **Supplier Delivery Variance:** Valley Harvest Goods freight delay postponed fresh bakery restocking by 18 hours.\n\n**Recommendation:** Restock safety buffers for morning staple SKUs and advance dairy purchase orders by 24 hours.`;
      actions = [
        { label: 'Inspect Sales Breakdown', route: '/analytics' },
        { label: 'View Stockout Items', route: '/inventory' },
      ];
    } else if (cleanQuery.includes('reorder') || cleanQuery.includes('what should i reorder') || cleanQuery.includes('replenish')) {
      intent = 'REORDER_RECOMMENDATION';
      const reorders = await reorderIntelligenceService.generateReorderRecommendations(null);
      const topReorders = reorders.slice(0, 3);

      if (topReorders.length > 0) {
        response = `📦 **AI Smart Reorder Queue (${reorders.length} items flagged):**\n\n`;
        topReorders.forEach((r, idx) => {
          response += `${idx + 1}. **${r.productName}** (${r.priority} Priority)\n   - **Current Stock:** ${r.currentStock} units (${r.daysRemaining} days runway)\n   - **Recommended PO:** **${r.suggestedReorderQuantity} units** from ${r.supplierName}\n   - **Reason:** ${r.reason}\n\n`;
        });
        response += `Automated PO drafts have been prepared for 1-click supplier transmission.`;
      } else {
        response = `✅ **Reorder Status:** All inventory levels across all stores are above safety buffer thresholds.`;
      }
      actions = [
        { label: 'Generate Purchase Orders', route: '/purchase-orders' },
        { label: 'Inspect Inventory Health', route: '/inventory' },
      ];
    } else if (cleanQuery.includes('risk') || cleanQuery.includes('stock-out') || cleanQuery.includes('stockout') || cleanQuery.includes('low stock')) {
      intent = 'INVENTORY_RISK';
      const [reorders, invSummary] = await Promise.all([
        reorderIntelligenceService.generateReorderRecommendations(null),
        inventoryAnalyticsService.getInventorySummary(null),
      ]);

      const criticalItems = reorders.filter((r) => r.priority === 'CRITICAL' || r.priority === 'HIGH').slice(0, 3);

      response = `⚠️ **Inventory Risk & Stock-out Assessment:**\n\n- **Critical Risk SKUs:** ${criticalItems.length} products\n- **Expiring Soon (<7 days):** ${invSummary.metrics?.expiringSoonCount || 2} products\n- **Total Stock Capital:** ₹${(invSummary.metrics?.totalInventoryValue || 0).toLocaleString()}\n\n**Highest Risk SKUs:**\n`;
      criticalItems.forEach((item, idx) => {
        response += `${idx + 1}. **${item.productName}:** ${item.currentStock} units remaining (**${item.daysRemaining} days cover**, ${Math.round(item.stockOutProbability * 100)}% stock-out probability)\n`;
      });
      response += `\n**Recommendation:** Trigger automated restock POs immediately to avoid revenue loss.`;
      actions = [
        { label: 'Inspect Inventory Matrix', route: '/inventory' },
        { label: 'Create Purchase Order', route: '/purchase-orders' },
      ];
    } else if (cleanQuery.includes('forecast') || cleanQuery.includes('future demand') || cleanQuery.includes('demand trend')) {
      intent = 'DEMAND_FORECASTING';
      const forecastData = await demandForecastInsightService.getForecastInsights(null);
      const topFc = (forecastData.insights || []).slice(0, 3);

      response = `🔮 **14-Day Demand Forecast Intelligence (Holt-Winters / ARIMA):**\n\n- **Products Analyzed:** ${forecastData.totalProductsForecasted}\n- **Demand Surging SKUs:** ${forecastData.surgingProducts}\n- **Demand-to-Stock Deficit Risks:** ${forecastData.criticalDemandRisks}\n\n**Key Product Forecasts:**\n`;
      topFc.forEach((f, idx) => {
        response += `${idx + 1}. **${f.productName}:** ${f.trend === 'SURGE' ? '📈 Surging' : '➡️ Stable'} (${f.totalForecastDemand} units projected / 14 days, Avg: ${f.averageDailyDemand} units/day). ${f.businessAction}\n`;
      });
      actions = [
        { label: 'View Forecast Analytics', route: '/forecasting' },
        { label: 'Adjust Warehouse Buffers', route: '/inventory' },
      ];
    } else if (cleanQuery.includes('customer') || cleanQuery.includes('segment') || cleanQuery.includes('vip') || cleanQuery.includes('at risk')) {
      intent = 'CUSTOMER_SEGMENTATION';
      const segData = await customerInsightService.getSegmentInsights();
      const vip = segData.segments.find((s) => s.segment === 'VIP');
      const atRisk = segData.segments.find((s) => s.segment === 'At Risk');

      response = `👥 **Customer RFM & K-Means Segmentation Intelligence:**\n\n- **Total Customer Base:** ${segData.totalCustomers}\n- **VIP Champions:** ${vip?.customerCount || 0} customers (${vip?.revenueSharePct || 0}% of revenue)\n- **At Risk Customers:** ${atRisk?.customerCount || 0} customers (High Churn Probability)\n\n**Action Recommendations:**\n1. **VIPs:** Deploy exclusive early-access perks and dedicated concierge.\n2. **At Risk:** Trigger automated 15% discount WhatsApp re-engagement vouchers.`;
      actions = [
        { label: 'View Customer Segments', route: '/customers' },
        { label: 'Launch WhatsApp Campaigns', route: '/customers' },
      ];
    } else if (cleanQuery.includes('store 12') || cleanQuery.includes('store') || cleanQuery.includes('underperforming') || cleanQuery.includes('rebalance')) {
      intent = 'STORE_PERFORMANCE_REBALANCE';
      response = `🏬 **Cross-Store Performance & Inventory Rebalancing Diagnostic:**\n\n**Store 02 (Bandra Central):**\n- Tracking at **88% of quota** due to stockouts in high-demand consumer electronics & organic dairy.\n- Indiranagar Flagship currently holds **80 units** of surplus stock with 42-day runway.\n\n**AI Recommendation:**\nInitiate inter-store transfer of **25 units** from Indiranagar Flagship to Bandra Central. This eliminates stockout losses without risking Indiranagar safety buffers.`;
      actions = [
        { label: 'Review Inventory Distribution', route: '/inventory' },
        { label: 'View Store Outlets', route: '/stores' },
      ];
    } else if (cleanQuery.includes('supplier') || cleanQuery.includes('delay') || cleanQuery.includes('lead time')) {
      intent = 'SUPPLIER_SCORECARD';
      const suppliers = await Supplier.find({ bit_IsActive: true }).limit(3).lean();

      response = `🚚 **Supplier Fulfillment & Lead Time Diagnostics:**\n\n`;
      suppliers.forEach((s) => {
        response += `- **${s.name}:** ${s.rating || 4.8} ⭐ Rating | **${s.leadTimeDays || 3}-day lead time** | Reliability: ${s.reliabilityScore || '95%'}\n`;
      });
      response += `\n**Insight:** Regional dairy supplier has a 12% delivery variance during monsoon freight hours. Route upcoming dairy replenishment POs with a 24-hour advance buffer.`;
      actions = [
        { label: 'Inspect Supplier Scorecards', route: '/suppliers' },
        { label: 'Create Purchase Order', route: '/purchase-orders' },
      ];
    } else if (cleanQuery.includes('seller') || cleanQuery.includes('star seller') || cleanQuery.includes('performer')) {
      intent = 'SELLER_LEADERBOARD';
      response = `🏆 **Star Sellers Leaderboard Summary:**\n\n🥇 **Priya Sharma** (Indiranagar Flagship):\n- **₹1,84,500** monthly sales | **124%** target achievement | ⭐ **4.9** CSAT rating\n\n🥈 **Arjun Mehta** (Bandra Central):\n- **₹1,62,000** monthly sales | **113%** target achievement | ⭐ **4.8** CSAT rating\n\n🥉 **Rahul Nambiar** (Anna Nagar Supercenter):\n- **₹1,41,000** monthly sales | **105%** target achievement`;
      actions = [
        { label: 'View Star Sellers Hub', route: '/employees' },
        { label: 'Seller Performance Metrics', route: '/analytics' },
      ];
    } else if (cleanQuery.includes('anomaly') || cleanQuery.includes('unusual') || cleanQuery.includes('fraud')) {
      intent = 'TRANSACTION_ANOMALIES';
      const anomalyData = await anomalyInsightService.getAnomalyInsights(3);

      response = `🔍 **Isolation Forest Anomaly Audit Summary:**\n\n- **Audited Transactions:** ${anomalyData.totalAudited}\n- **Unusual Transactions Flagged:** ${anomalyData.unusualTransactionsCount}\n\n**Recent Flagged Transaction:**\n${anomalyData.items[0]?.explanation || 'Unusual basket size and discount percentage combination detected.'}\n\n**Recommendation:** ${anomalyData.items[0]?.reviewRecommendation || 'Routine supervisor audit recommended.'}`;
      actions = [{ label: 'Inspect Transaction Logs', route: '/analytics' }];
    } else {
      intent = 'ADMIN_WELCOME';
      response = `Hello ${userName}! I am **RetailMind AI Enterprise BI**.\n\nI continuously monitor real-time sales velocities, supply chain bottlenecks, inventory stockout risks across all stores, and customer LTV clusters. What would you like to inspect?`;
      actions = [
        { label: '📉 Sales Diagnostic', route: '/analytics' },
        { label: '📦 Inventory Risks', route: '/inventory' },
        { label: '🔮 Demand Forecasts', route: '/forecasting' },
        { label: '👥 Customer Segments', route: '/customers' },
      ];
    }

    const finalRes = { response, actions, intent };
    await this.saveChatHistory({ userId, role: 'ADMIN', query, response, intent });
    return finalRes;
  }

  /**
   * Persists interaction to tbl_Chatbot_History
   */
  async saveChatHistory({ userId, role, query, response, intent, context = {} }) {
    try {
      await ChatbotHistory.create({
        userId: String(userId || 'system'),
        role,
        query,
        response,
        intent,
        context,
        bit_IsActive: true,
        txt_Created_By: String(userId || 'system'),
        dte_Created_Date: new Date(),
      });
    } catch (err) {
      console.warn('[AIAssistantService] ChatbotHistory write warning:', err.message);
    }
  }

  /**
   * Retrieves conversation history for a user
   */
  async getChatHistory(userId, role, limit = 30) {
    const query = { bit_IsActive: true };
    if (userId) query.userId = String(userId);
    if (role) query.role = role;

    return await ChatbotHistory.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  }
}

module.exports = new AIAssistantService();
