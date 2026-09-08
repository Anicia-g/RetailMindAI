const mongoose = require('mongoose');

const anomalyLogSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      required: true,
      index: true,
    },
    orderId: {
      type: String,
      default: null,
      index: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    itemCount: {
      type: Number,
      required: true,
    },
    hourOfDay: {
      type: Number,
      default: 14,
    },
    discountPct: {
      type: Number,
      default: 0,
    },
    isAnomaly: {
      type: Boolean,
      required: true,
      index: true,
    },
    anomalyScore: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['Normal Transaction', 'Unusual - Requires Manager Review', 'Resolved Normal', 'Action Taken'],
      default: 'Normal Transaction',
      index: true,
    },
    importantFeatures: [
      {
        type: String,
      },
    ],
    algorithm: {
      type: String,
      default: 'Isolation Forest (Unsupervised)',
    },
    modelVersion: {
      type: String,
      default: 'anomaly_isolation_forest_v1',
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
    collection: 'tbl_Anomaly_Log',
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

const AnomalyLog =
  mongoose.models.AnomalyLog || mongoose.model('AnomalyLog', anomalyLogSchema);

module.exports = AnomalyLog;
