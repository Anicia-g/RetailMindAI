import { ROLES } from '@/lib/auth';

// Role-specific quick prompts
export const roleAIPrompts = {
  ADMIN: [
    'Which store needs inventory rebalancing?',
    'Who is the top performing seller?',
    'Which supplier has the highest delay rate?',
    'Why did sales drop this week?',
    'Which products are at risk of stock-out?',
    'Who are our high-value customer champions?',
  ],
  SELLER: [
    'Which products need a discount?',
    'Who are my best customers?',
    'Which products may run out today?',
    'What should I restock?',
    'Why are yogurt sales falling?',
    'What discount should I offer for yogurt?',
  ],
  CUSTOMER: [
    "What are today's best deals?",
    'Which milk is most popular?',
    'Track my order',
    'Can you suggest ingredients for a healthy pasta dinner?',
    'What promo coupon codes are available?',
    'How do I use my SmartCoins rewards?',
  ],
};

export const sampleAIPrompts = roleAIPrompts.ADMIN;

// ADMIN Knowledge Base (Full executive BI, forecasting, supplier costs, employee KPIs)
const adminKnowledgeBase = [
  {
    triggers: ['inventory rebalancing', 'rebalancing', 'store needs inventory'],
    response: `**Cross-Store Inventory Rebalancing Intelligence:**
Store 12 (Bandra Central) is experiencing stockouts for **Wireless Ergonomic Mouse (WM-001)** (0 units in stock) with 14 pending requests, while Indiranagar Flagship has **80 units** with 42-day runway.

**Recommendation:**
Transfer **25 units** from Indiranagar Flagship to Bandra Central. This eliminates stockout loss without jeopardizing Indiranagar's safety buffer.`,
    actions: [
      { label: 'Review Inventory Distribution', route: '/inventory' },
      { label: 'View Store Outlets', route: '/stores' },
    ],
  },
  {
    triggers: ['top performing seller', 'star seller', 'best seller', 'who is the top'],
    response: `**Star Sellers Leaderboard Summary:**
🥇 **Priya Sharma** (Indiranagar Flagship):
- **₹1,84,500** monthly sales | **124%** target achievement | ⭐ **4.9** CSAT rating | **98%** performance score.

🥈 **Arjun Mehta** (Bandra Central):
- **₹1,62,000** monthly sales | **113%** target achievement | ⭐ **4.8** CSAT rating | **94%** score.

🥉 **Rahul Nambiar** (Anna Nagar Supercenter):
- **₹1,41,000** monthly sales | **105%** target achievement | ⭐ **4.7** rating.`,
    actions: [
      { label: 'View Star Sellers Hub', route: '/employees' },
      { label: 'Seller Performance Metrics', route: '/analytics' },
    ],
  },
  {
    triggers: ['supplier', 'delay rate', 'highest delay'],
    response: `**Supplier Fulfillment & Lead Time Diagnostic:**
**FreshDairy Farms Direct** has the highest delay rate (**18.4% of PO deliveries delayed by > 2 days**), leading to localized dairy stockouts at Store 01.

**Alternative Recommended:**
Route pending dairy reorders to **Dairy Express Farms** (99.2% on-time delivery, ₹48/unit bulk rate).`,
    actions: [
      { label: 'Inspect Supplier Scorecards', route: '/suppliers' },
      { label: 'Create Purchase Order', route: '/purchase-orders', isAction: true },
    ],
  },
  {
    triggers: ['sales drop', 'drop this week', 'sales down', 'revenue dropped', 'sales decline'],
    response: `**Weekly Sales Diagnostic (Executive Summary):**
Overall sales fell by **8.2% (₹98,400 deficit)** compared to last week's forecast.

**Root Cause Analysis:**
1. **Stock-Out Bottleneck at Store 12 (Bandra Central):** High-velocity items (*Wireless Mouse* & *Stainless Flasks*) were out of stock for 4 consecutive days, accounting for 65% of the lost revenue.
2. **Delayed Inward Shipment:** PO-2024-8790 delivered 3 days late, stalling weekend footfall conversions.
3. **Category Divergence:** Electronics demand was up +18%, but inability to fulfill orders reduced realized revenue.`,
    actions: [
      { label: 'View Sales Analysis', route: '/sales' },
      { label: 'Inspect Inventory Risk', route: '/inventory' },
      { label: 'Create Reorder PO', route: '/purchase-orders', isAction: true },
    ],
  },
  {
    triggers: ['at risk', 'stock-out', 'stockout', 'out of stock', 'low stock'],
    response: `**Inventory Risk Diagnostic:**
Identified **3 high-risk products** requiring immediate replenishment:

1. **Organic Whole Milk (DAIRY-001)**: Current Stock: **12 packs** | Daily Velocity: **18 units/day** | Runway: **0.8 Days**
2. **Wireless Ergonomic Mouse (WM-001)**: Current Stock: **20 units** | Daily Velocity: **6.4 units/day** | Runway: **3.1 Days**
3. **Premium Arabica Coffee Beans (BEV-882)**: Current Stock: **8 units** | Daily Velocity: **4.2 units/day** | Runway: **1.9 Days**`,
    actions: [
      { label: 'Open Inventory Risk Hub', route: '/inventory' },
      { label: 'Create Recommended PO', route: '/purchase-orders', isAction: true },
    ],
  },
  {
    triggers: ['high value', 'champions', 'top customers', 'customer segments', 'clustering', 'rfm'],
    response: `**Customer Intelligence Summary:**
K-Means Clustering segmented your **790 active customer profiles** into 4 distinct cohorts:

- **Cluster 1: High Value Champions (142 customers - 18% of base)**:
  - Generates **₹1.45L average LTV** with an average purchase frequency of 28 orders.
  - Top buyer: *Vikram Malhotra* (₹1.84L total spent).
- **Cluster 4: Churn Risk VIPs (103 customers - 13% of base)**:
  - High historical spenders with recency > 60 days. Opportunity to recover ₹54,000 avg LTV per account.`,
    actions: [
      { label: 'View Customer Intelligence', route: '/customers' },
      { label: 'Run K-Means Segmentation', route: '/customers', isClustering: true },
    ],
  },
];

// SELLER Knowledge Base (Shift KPIs, POS sales, aisle inventory alerts, customer service)
const sellerKnowledgeBase = [
  {
    triggers: ['which products need a discount', 'need a discount', 'discount recommendation', 'discount'],
    response: `**Smart Discount Recommendation (C4.5 Decision Tree Classifier):**
1. **Greek Probiotic Natural Yogurt (YOG-004)**:
   - Current Stock: **145 units** | Daily Velocity: **10 units/day (-22% trend)** | Shelf Life: **5 days left**.
   - Recommended Discount: **15% OFF** (Confidence: 87%).
   - Rationale: High inventory buffer and approaching expiry. A 15% promotional discount will accelerate sell-through from 10 to 18 units/day, preventing ₹11,200 in expired product write-offs.

2. **Artisan Sourdough Loaf (BAKE-102)**:
   - Current Stock: **40 units** | Shelf Life: **2 days**.
   - Recommended Discount: **10% OFF** (Confidence: 82%).`,
    actions: [
      { label: 'Open Store Inventory Terminal', route: '/seller/inventory' },
      { label: 'View Best Sellers', route: '/seller/best-sellers' },
    ],
  },
  {
    triggers: ['why are yogurt sales falling', 'yogurt sales', 'yogurt falling'],
    response: `**Diagnostic for Greek Probiotic Natural Yogurt:**
Yogurt sales dropped by **22% over the last 14 days** due to:
1. Increased competition from plant-based oat alternatives.
2. Premium pricing (₹160 vs market benchmark ₹135).
3. Current stock is **145 units** with only **5 days shelf life remaining**.

**Recommended Action:**
Apply the C4.5 algorithm's **15% discount (₹136 new price)** immediately to clear 85 units before expiration.`,
    actions: [
      { label: 'Apply 15% Discount Now', route: '/seller/inventory' },
    ],
  },
  {
    triggers: ['what discount should i offer for yogurt', 'offer for yogurt', 'discount for yogurt'],
    response: `**Optimal Discount Analysis for Yogurt:**
- Model: **C4.5 Decision Tree Classifier (Gain Ratio)**
- Recommended: **15% OFF** (₹136 / unit)
- Confidence: **87%**
- **Elasticity Simulation:**
  - 0% discount $\to$ 10.0 units/day (Risk: 95 units expire)
  - 5% discount $\to$ 12.0 units/day
  - 10% discount $\to$ 14.0 units/day
  - **15% discount $\to$ 18.0 units/day (Optimal sell-through with 29.4% profit margin)**
  - 20% discount $\to$ 19.0 units/day (Unnecessary margin erosion)`,
    actions: [
      { label: 'Open Discount Analysis Modal', route: '/seller/inventory' },
    ],
  },
  {
    triggers: ['who are my best customers', 'best customers', 'top customers'],
    response: `**🏆 Best Store Customers (Indiranagar Flagship):**
1. **Vikram Malhotra** (Top Customer & Highest Spender):
   - **₹1,84,500** total spent | 34 completed orders | AOV ₹5,426 | Last purchase: 2 days ago.
2. **Ananya Iyer** (High-Value VIP):
   - **₹68,420** spent | 26 orders | High weekly organic dairy frequency.
3. **Meena Krishnan** (Most Frequent Customer):
   - **38 orders** | ₹48,900 spent | Daily morning shopper.
4. **Priya Sundaram** (⚠️ At-Risk Valuable Customer):
   - Previously **₹59,800 spent**, but no order for 45 days. Needs win-back re-engagement.`,
    actions: [
      { label: 'View My Store Customers', route: '/seller/customers' },
    ],
  },
  {
    triggers: ['run out today', 'products may run out', 'stockout today'],
    response: `**Critical Stockout Warnings for Today:**
1. **Farm Fresh Whole Milk 1L**:
   - Current Store Stock: **24 units**
   - Expected Daily Demand: **18 units/day**
   - Runway: **1.3 Days** (Depletes by tomorrow noon!)
2. **Fresh Sourdough Bread**:
   - Current Stock: **8 loaves** | Depletes in **~4 hours**.`,
    actions: [
      { label: 'Requisition Restock from Warehouse', route: '/seller/inventory' },
    ],
  },
  {
    triggers: ['what should i restock', 'restock', 'aisle inventory', 'restock items'],
    response: `**Priority Store Restock Checklist:**
1. **Farm Fresh Milk 1L**: Requisition **40 units** from central cold-storage.
2. **Fresh Sourdough Bread**: Requisition **25 units** from in-store bakery.
3. **Organic Fuji Apples**: Requisition **30 kg** from produce cold room.`,
    actions: [
      { label: 'Open Store Inventory Terminal', route: '/seller/inventory' },
    ],
  },
];

// CUSTOMER Knowledge Base (Grocery advice, recipes, deals, vouchers, orders)
const customerKnowledgeBase = [
  {
    triggers: ['deals', 'offers', 'best deals', 'dairy and bakery', "today's best deals"],
    response: `**Today's Top Supermarket Deals for You:**
1. **Fresh Sourdough Bread**: 15% OFF (Now ₹120 instead of ₹140)
2. **Organic Greek Yogurt**: 20% OFF (Now ₹95 instead of ₹120)
3. **Farm Organic Apples 1kg**: 10% OFF (Now ₹180 instead of ₹200)

Use promo code **FRESH10** for an additional 10% instant discount at checkout!`,
    actions: [
      { label: 'Explore All Deals', route: '/shop/offers' },
      { label: 'View Fresh Bakery', route: '/shop/products?category=Bakery%20%26%20Snacks' },
    ],
  },
  {
    triggers: ['which milk is most popular', 'popular milk', 'milk recommendation'],
    response: `**Most Popular Milk at Indiranagar Store:**
🥇 **Farm Fresh Whole Milk 1L (Tetra Pack)**
- ⭐ **4.9 Rating** (320+ customer reviews)
- 100% pure pasteurized, sourced directly from local dairy co-ops.
- Price: **₹58 / pack** (Eligible for 15-minute express delivery).`,
    actions: [
      { label: 'Add Milk to Basket', route: '/shop/products?category=Dairy%20%26%20Eggs' },
    ],
  },
  {
    triggers: ['track my order', 'where is my order', 'order tracking', 'order status'],
    response: `**Live Order Tracking:**
- Order ID: **ORD-7741**
- Status: **Out for Delivery 🛵**
- Delivery Rider: Suresh Kumar (Est. arrival in **7 minutes**)
- Sourced from: Indiranagar Flagship Supermarket
- Contactless Delivery OTP: **4092**`,
    actions: [
      { label: 'View Order Details', route: '/shop/orders' },
    ],
  },
];

export const getAIResponse = (query, role = 'ADMIN') => {
  const normalized = query.toLowerCase();

  let kb = adminKnowledgeBase;
  if (role === ROLES.SELLER || role === 'SELLER') {
    kb = sellerKnowledgeBase;
  } else if (role === ROLES.CUSTOMER || role === 'CUSTOMER') {
    kb = customerKnowledgeBase;
  }

  for (const item of kb) {
    if (item.triggers.some((t) => normalized.includes(t))) {
      return item;
    }
  }

  // Role-appropriate fallback responses
  if (role === ROLES.CUSTOMER || role === 'CUSTOMER') {
    return {
      response: `**RetailMind Grocer Assistant:**
I searched our supermarket catalog for *"${query}"*.

**Highlights:**
- All fresh fruits, dairy, and bakery items are in stock for instant 15-min delivery.
- Remember to use code **FRESH10** for 10% off your basket!
- You have **450 SmartCoins (₹450 value)** ready to redeem.`,
      actions: [
        { label: 'Explore Products', route: '/shop/products' },
        { label: 'Today Deals', route: '/shop/offers' },
        { label: 'View My Basket', route: '/shop/cart' },
      ],
    };
  }

  if (role === ROLES.SELLER || role === 'SELLER') {
    return {
      response: `**RetailMind Seller Terminal Assistant:**
Analyzed shift metrics for query: *"${query}"*.

**Shift Snapshot:**
- Today's Shift Revenue: **₹48,250** (124% of quota)
- 3 items in your aisle have low stock alerts.
- Top moving category: **Dairy & Eggs**.`,
      actions: [
        { label: 'Shift Sales Log', route: '/seller/sales' },
        { label: 'Store Stock Alerts', route: '/seller/inventory' },
        { label: 'My Performance', route: '/seller/performance' },
      ],
    };
  }

  // Admin Fallback
  return {
    response: `**RetailMind Executive Intelligence:**
Analyzed query: *"${query}"* across store networks, ERP supply chains, and analytics models.

**Key Observations:**
- 3 high-velocity items have stock-out risk within 72 hours.
- 142 High-Value customers represent 48% of total gross profit.
- Monthly revenue is tracking **+14.2% above baseline** (₹12.4L recorded).`,
    actions: [
      { label: 'View Dashboard Overview', route: '/dashboard' },
      { label: 'Inspect Forecasts', route: '/forecasting' },
      { label: 'Open AI Assistant Center', route: '/ai-assistant' },
    ],
  };
};
