export const initialAnalytics = {
  kpis: {
    totalRevenue: 1240000,
    revenueGrowth: "+14.2%",
    totalOrders: 2450,
    orderGrowth: "+8.6%",
    averageOrderValue: 506,
    aovGrowth: "+5.1%",
    grossMarginPercent: 38.4,
    inventoryValue: 3520000,
    lowStockCount: 12,
    activeCustomersCount: 790
  },
  revenueTrendMonthly: [
    { month: "Jan", revenue: 820000, target: 750000, orders: 1650 },
    { month: "Feb", revenue: 890000, target: 800000, orders: 1780 },
    { month: "Mar", revenue: 950000, target: 900000, orders: 1910 },
    { month: "Apr", revenue: 920000, target: 920000, orders: 1840 },
    { month: "May", revenue: 1040000, target: 980000, orders: 2080 },
    { month: "Jun", revenue: 1110000, target: 1050000, orders: 2210 },
    { month: "Jul", revenue: 1180000, target: 1100000, orders: 2340 },
    { month: "Aug", revenue: 1240000, target: 1150000, orders: 2450 }
  ],
  categoryPerformance: [
    { category: "Electronics", revenue: 640000, share: 51.6, growth: "+18%", margin: "42%" },
    { category: "Groceries & Gourmet", revenue: 290000, share: 23.4, growth: "+12%", margin: "28%" },
    { category: "Home & Lifestyle", revenue: 180000, share: 14.5, growth: "+9%", margin: "36%" },
    { category: "Apparel & Accessories", revenue: 130000, share: 10.5, growth: "+4%", margin: "48%" }
  ],
  storePerformance: [
    { store: "Indiranagar Flagship (Store 01)", city: "Bangalore", revenue: 4850000, target: 4500000, completion: "107.7%", health: "Healthy" },
    { store: "Connaught Place Hub (Store 04)", city: "New Delhi", revenue: 5120000, target: 4800000, completion: "106.6%", health: "Healthy" },
    { store: "Bandra Central (Store 12)", city: "Mumbai", revenue: 3920000, target: 4400000, completion: "89.1%", health: "Critical (Stockout Loss)" },
    { store: "Anna Nagar Supercenter (Store 03)", city: "Chennai", revenue: 3450000, target: 3600000, completion: "95.8%", health: "Low Stock" }
  ],
  paymentMethodDistribution: [
    { method: "UPI & Instant QR", percentage: 48, amount: 595200 },
    { method: "Credit Cards", percentage: 32, amount: 396800 },
    { method: "Corporate Net Banking", percentage: 12, amount: 148800 },
    { method: "Debit Cards / POS", percentage: 8, amount: 99200 }
  ]
};
