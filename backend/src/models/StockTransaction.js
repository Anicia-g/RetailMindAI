const mongoose = require('mongoose');

const stockTransactionSchema = new mongoose.Schema(
  {
    transactionId: {
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
    sku: {
      type: String,
      default: '',
    },
    storeId: {
      type: String,
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['IN', 'OUT', 'SALE', 'PURCHASE', 'RETURN', 'ADJUSTMENT'],
      required: true,
      index: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    previousStock: {
      type: Number,
      default: 0,
    },
    newStock: {
      type: Number,
      default: 0,
    },
    referenceId: {
      type: String,
      default: null,
      index: true,
    },
    performedBy: {
      type: String,
      default: 'system',
    },
    reason: {
      type: String,
      default: 'Inventory update',
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        ret.id = ret.transactionId || (ret._id ? ret._id.toString() : ret.id);
        delete ret.__v;
        return ret;
      },
    },
  }
);

const StockTransaction =
  mongoose.models.StockTransaction || mongoose.model('StockTransaction', stockTransactionSchema);

module.exports = StockTransaction;
