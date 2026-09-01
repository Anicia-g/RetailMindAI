export const initialPurchaseOrders = [
  {
    id: "PO-8801",
    poNumber: "PO-2024-8801",
    supplier: "Apex Tech Distributors",
    supplierId: "sup-001",
    orderDate: "2024-08-22",
    expectedDelivery: "2024-08-25",
    totalCost: 124000,
    status: "Pending Approval",
    isAiGenerated: true,
    items: [
      { name: "Wireless Ergonomic Mouse", sku: "WM-001", quantity: 40, unitCost: 1100, total: 44000 },
      { name: "Mechanical Gaming Keyboard RGB", sku: "KB-204", quantity: 25, unitCost: 3200, total: 80000 }
    ],
    notes: "AI Recommended auto-reorder based on demand surge (+32% velocity) and low stock trigger."
  },
  {
    id: "PO-8802",
    poNumber: "PO-2024-8802",
    supplier: "Valley Harvest Goods",
    supplierId: "sup-002",
    orderDate: "2024-08-21",
    expectedDelivery: "2024-08-23",
    totalCost: 42550,
    status: "In Transit",
    isAiGenerated: true,
    items: [
      { name: "Premium Arabica Coffee Beans (1kg)", sku: "BEV-882", quantity: 60, unitCost: 580, total: 34800 },
      { name: "Organic Oat Milk 1L", sku: "DAIRY-109", quantity: 50, unitCost: 155, total: 7750 }
    ],
    notes: "Restocking critical inventory across Chennai and Bangalore distribution points."
  },
  {
    id: "PO-8803",
    poNumber: "PO-2024-8790",
    supplier: "EcoLiving Supplies",
    supplierId: "sup-004",
    orderDate: "2024-08-10",
    expectedDelivery: "2024-08-14",
    totalCost: 18900,
    status: "Delivered",
    isAiGenerated: false,
    items: [
      { name: "Stainless Steel Hydration Flask (750ml)", sku: "LIF-551", quantity: 45, unitCost: 420, total: 18900 }
    ],
    notes: "Standard monthly restock."
  }
];

export const aiSuggestedOrder = {
  supplier: "Apex Tech Distributors",
  supplierId: "sup-001",
  estimatedCost: 124000,
  items: [
    { name: "Wireless Ergonomic Mouse", sku: "WM-001", quantity: 40, unitCost: 1100, total: 44000, reason: "Stock-out in 3 days (+32% velocity)" },
    { name: "Mechanical Gaming Keyboard RGB", sku: "KB-204", quantity: 25, unitCost: 3200, total: 80000, reason: "Stock-out in 4 days (+18% velocity)" }
  ]
};
