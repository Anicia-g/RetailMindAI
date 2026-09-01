export const initialForecasts = [
  {
    productId: "prod-001",
    productName: "Wireless Ergonomic Mouse",
    sku: "WM-001",
    currentDemandDaily: 6.4,
    forecastDemand7d: 7.8,
    forecastDemand14d: 8.5,
    forecastDemand30d: 9.2,
    confidenceScore: "94%",
    currentStock: 20,
    projectedStockoutDate: "3 Days (Critical)",
    reorderRecommendation: "Generate PO for 40 units immediately from Apex Tech Distributors.",
    forecastModel: "ARIMA + Holt-Winters Hybrid Seasonal",
    timeSeries: [
      { date: "Day -14", actual: 4.8, forecast: 4.6, lower: 4.0, upper: 5.2 },
      { date: "Day -10", actual: 5.2, forecast: 5.0, lower: 4.4, upper: 5.6 },
      { date: "Day -7", actual: 5.8, forecast: 5.7, lower: 5.0, upper: 6.4 },
      { date: "Day -3", actual: 6.2, forecast: 6.1, lower: 5.3, upper: 6.9 },
      { date: "Today", actual: 6.4, forecast: 6.4, lower: 5.6, upper: 7.2 },
      { date: "+3 Days", actual: null, forecast: 7.2, lower: 6.0, upper: 8.4 },
      { date: "+7 Days", actual: null, forecast: 7.8, lower: 6.5, upper: 9.1 },
      { date: "+14 Days", actual: null, forecast: 8.5, lower: 7.0, upper: 10.0 },
      { date: "+30 Days", actual: null, forecast: 9.2, lower: 7.5, upper: 10.9 }
    ]
  },
  {
    productId: "prod-002",
    productName: "Mechanical Gaming Keyboard RGB",
    sku: "KB-204",
    currentDemandDaily: 3.1,
    forecastDemand7d: 3.8,
    forecastDemand14d: 4.1,
    forecastDemand30d: 4.5,
    confidenceScore: "91%",
    currentStock: 14,
    projectedStockoutDate: "4.5 Days (High Risk)",
    reorderRecommendation: "Order 25 units. Regional tournament traffic will drive 22% spike next weekend.",
    forecastModel: "Gradient Boosted Multi-Horizon",
    timeSeries: [
      { date: "Day -14", actual: 2.5, forecast: 2.4, lower: 1.9, upper: 2.9 },
      { date: "Day -7", actual: 2.8, forecast: 2.8, lower: 2.2, upper: 3.4 },
      { date: "Today", actual: 3.1, forecast: 3.1, lower: 2.5, upper: 3.7 },
      { date: "+7 Days", actual: null, forecast: 3.8, lower: 3.0, upper: 4.6 },
      { date: "+14 Days", actual: null, forecast: 4.1, lower: 3.2, upper: 5.0 },
      { date: "+30 Days", actual: null, forecast: 4.5, lower: 3.5, upper: 5.5 }
    ]
  },
  {
    productId: "prod-003",
    productName: "Premium Arabica Coffee Beans (1kg)",
    sku: "BEV-882",
    currentDemandDaily: 4.2,
    forecastDemand7d: 5.1,
    forecastDemand14d: 5.4,
    forecastDemand30d: 5.8,
    confidenceScore: "96%",
    currentStock: 8,
    projectedStockoutDate: "1.9 Days (Immediate Action)",
    reorderRecommendation: "Critical: Order 60 units from Valley Harvest Goods immediately.",
    forecastModel: "Prophet Seasonal Trend Model",
    timeSeries: [
      { date: "Day -14", actual: 3.2, forecast: 3.1, lower: 2.6, upper: 3.6 },
      { date: "Day -7", actual: 3.8, forecast: 3.7, lower: 3.1, upper: 4.3 },
      { date: "Today", actual: 4.2, forecast: 4.2, lower: 3.5, upper: 4.9 },
      { date: "+7 Days", actual: null, forecast: 5.1, lower: 4.2, upper: 6.0 },
      { date: "+14 Days", actual: null, forecast: 5.4, lower: 4.4, upper: 6.4 },
      { date: "+30 Days", actual: null, forecast: 5.8, lower: 4.7, upper: 6.9 }
    ]
  }
];
