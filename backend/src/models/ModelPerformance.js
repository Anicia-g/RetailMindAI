const mongoose = require('mongoose');

const modelPerformanceSchema = new mongoose.Schema(
  {
    modelName: {
      type: String,
      required: true,
      index: true,
    },
    modelType: {
      type: String,
      enum: ['CLUSTERING', 'FORECASTING', 'CLASSIFICATION', 'DECISION_TREE', 'ASSOCIATION', 'ANOMALY_DETECTION'],
      required: true,
      index: true,
    },
    modelVersion: {
      type: String,
      required: true,
    },
    trainedDate: {
      type: Date,
      default: Date.now,
    },
    datasetSize: {
      type: Number,
      default: 0,
    },
    features: [
      {
        type: String,
      },
    ],
    metrics: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'TRAINED', 'EVALUATED', 'DEPRECATED'],
      default: 'ACTIVE',
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
    collection: 'tbl_Model_Performance',
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

const ModelPerformance =
  mongoose.models.ModelPerformance || mongoose.model('ModelPerformance', modelPerformanceSchema);

module.exports = ModelPerformance;
