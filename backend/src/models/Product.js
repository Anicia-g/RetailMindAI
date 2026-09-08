const mongoose = require('mongoose');

const storeAssignmentSchema = new mongoose.Schema(
  {
    storeId: { type: String, required: true },
    storeName: { type: String, required: true },
    sellerName: { type: String, default: 'Store Associate' },
    stock: { type: Number, default: 0 },
    dailyVelocity: { type: Number, default: 0 },
    stockStatus: { type: String, default: 'Healthy' },
  },
  { _id: false }
);

const smartDiscountSchema = new mongoose.Schema(
  {
    recommended: { type: Number, default: 0 },
    model: { type: String, default: 'C4.5' },
    confidence: { type: Number, default: 85 },
    reason: { type: String, default: '' },
    factors: { type: [String], default: [] },
    expectedEffect: { type: String, default: '' },
    previousPerformance: [
      {
        discount: Number,
        velocity: Number,
        margin: Number,
      },
    ],
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      index: true,
    },
    sku: {
      type: String,
      required: [true, 'SKU is required'],
      unique: true,
      trim: true,
      index: true,
    },
    category: {
      type: String,
      required: true,
      index: true,
    },
    brand: {
      type: String,
      default: 'RetailMind Select',
      index: true,
    },
    unit: {
      type: String,
      default: 'Unit',
    },
    price: {
      type: Number,
      required: true,
    },
    originalPrice: {
      type: Number,
      required: true,
    },
    discountPct: {
      type: Number,
      default: 0,
    },
    costPrice: {
      type: Number,
      default: 0,
    },
    tax: {
      type: Number,
      default: 0,
    },
    stock: {
      type: Number,
      default: 0,
    },
    reorderLevel: {
      type: Number,
      default: 20,
    },
    supplier: {
      type: String,
      default: 'General Supplier',
    },
    supplierId: {
      type: String,
      default: 'sup-001',
    },
    seller: {
      type: String,
      default: 'Priya Sharma',
    },
    sellerId: {
      type: String,
      default: 'emp-001',
    },
    store: {
      type: String,
      default: 'Indiranagar Flagship (Store 01)',
    },
    storeId: {
      type: String,
      default: 'store-01',
      index: true,
    },
    storeAssignments: [storeAssignmentSchema],
    status: {
      type: String,
      enum: ['Active', 'Draft', 'Archived', 'Discontinued'],
      default: 'Active',
    },
    stockStatus: {
      type: String,
      enum: ['Healthy', 'Low Stock', 'Critical', 'Overstock'],
      default: 'Healthy',
    },
    dailyVelocity: {
      type: Number,
      default: 0,
    },
    velocityChange: {
      type: String,
      default: '+0%',
    },
    stockoutRisk: {
      type: Number,
      default: 0,
    },
    expectedStockoutDays: {
      type: Number,
      default: 10,
    },
    suggestedReorder: {
      type: Number,
      default: 50,
    },
    unitsSold: {
      type: Number,
      default: 0,
    },
    revenue: {
      type: Number,
      default: 0,
    },
    salesGrowth: {
      type: String,
      default: '+0%',
    },
    rating: {
      type: Number,
      default: 4.8,
    },
    ratingCount: {
      type: Number,
      default: 50,
    },
    expiryDays: {
      type: Number,
      default: 30,
    },
    demandLevel: {
      type: String,
      enum: ['High', 'Medium', 'Low', 'Critical'],
      default: 'Medium',
    },
    inventoryLevel: {
      type: String,
      default: 'Healthy',
    },
    image: {
      type: String,
      default: '',
    },
    smartDiscount: smartDiscountSchema,
    salesTrend: [
      {
        date: String,
        sales: Number,
      },
    ],
    forecastTrend: [
      {
        day: String,
        actualDemand: Number,
        forecast: Number,
        lower: Number,
        upper: Number,
      },
    ],
    aiInsight: {
      type: String,
      default: '',
    },
    // Audit fields
    bit_IsActive: {
      type: Boolean,
      default: true,
    },
    txt_Created_By: {
      type: String,
      default: 'system',
    },
    dte_Created_Date: {
      type: Date,
      default: Date.now,
    },
    txt_Modified_By: {
      type: String,
      default: 'system',
    },
    dte_Modified_Date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        ret.id = ret.productId || (ret._id ? ret._id.toString() : ret.id);
        delete ret.__v;
        return ret;
      },
    },
  }
);

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

module.exports = Product;
