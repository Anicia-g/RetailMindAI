const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema(
  {
    inventoryId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    productId: {
      type: String,
      required: true,
      index: true,
    },
    productName: {
      type: String,
      required: true,
    },
    sku: {
      type: String,
      required: true,
      index: true,
    },
    category: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      default: '',
    },
    store: {
      type: String,
      default: 'All Stores (Aggregated)',
    },
    storeId: {
      type: String,
      default: 'store-01',
      index: true,
    },
    currentStock: {
      type: Number,
      required: true,
      default: 0,
    },
    minStock: {
      type: Number,
      default: 20,
    },
    maxStock: {
      type: Number,
      default: 200,
    },
    dailyVelocity: {
      type: Number,
      default: 0,
    },
    daysRemaining: {
      type: Number,
      default: 10,
    },
    riskLevel: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Low',
    },
    stockoutProbability: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['Healthy', 'Low Stock', 'Critical', 'Overstock', 'Expiring'],
      default: 'Healthy',
    },
    location: {
      type: String,
      default: 'Aisle 1',
    },
    lastRestocked: {
      type: String,
      default: () => new Date().toISOString().split('T')[0],
    },
    suggestedReorder: {
      type: Number,
      default: 40,
    },
    reorderCost: {
      type: Number,
      default: 0,
    },
    supplier: {
      type: String,
      default: '',
    },
    supplierId: {
      type: String,
      default: 'sup-001',
    },
    aiRecommendation: {
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
        ret.id = ret.inventoryId || (ret._id ? ret._id.toString() : ret.id);
        delete ret.__v;
        return ret;
      },
    },
  }
);

inventorySchema.index({ storeId: 1, status: 1 });
inventorySchema.index({ currentStock: 1, minStock: 1 });

const Inventory = mongoose.models.Inventory || mongoose.model('Inventory', inventorySchema);

module.exports = Inventory;
