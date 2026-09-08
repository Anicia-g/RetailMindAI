const mongoose = require('mongoose');

const stockRiskSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      required: true,
      index: true,
    },
    productName: {
      type: String,
      default: '',
    },
    storeId: {
      type: String,
      default: 'store-01',
      index: true,
    },
    currentStock: {
      type: Number,
      required: true,
    },
    reorderLevel: {
      type: Number,
      default: 10,
    },
    riskLevel: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH'],
      required: true,
      index: true,
    },
    stockOutProbability: {
      type: Number,
      default: 0.5,
    },
    classProbabilities: {
      LOW: { type: Number, default: 0 },
      MEDIUM: { type: Number, default: 0 },
      HIGH: { type: Number, default: 0 },
    },
    daysRemaining: {
      type: Number,
      default: 0,
    },
    suggestedReorderQuantity: {
      type: Number,
      default: 0,
    },
    importantFactors: [
      {
        type: String,
      },
    ],
    modelVersion: {
      type: String,
      default: 'inventory_risk_v1',
    },
    generatedDate: {
      type: Date,
      default: Date.now,
    },
    // Standard Audit Fields
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
    collection: 'tbl_Stock_Risk',
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        ret.id = ret._id ? ret._id.toString() : ret.id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

const StockRisk = mongoose.models.StockRisk || mongoose.model('StockRisk', stockRiskSchema);

module.exports = StockRisk;
