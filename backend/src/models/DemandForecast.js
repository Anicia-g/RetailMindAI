const mongoose = require('mongoose');

const forecastPointSchema = new mongoose.Schema(
  {
    date: { type: String, required: true },
    predictedDemand: { type: Number, required: true },
    confidenceLower: { type: Number, default: 0 },
    confidenceUpper: { type: Number, default: 0 },
  },
  { _id: false }
);

const demandForecastSchema = new mongoose.Schema(
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
    horizonDays: {
      type: Number,
      required: true,
    },
    totalForecastDemand: {
      type: Number,
      required: true,
    },
    averageDailyDemand: {
      type: Number,
      required: true,
    },
    algorithm: {
      type: String,
      enum: ['ARIMA', 'Holt-Winters', 'Exponential Smoothing', 'Insufficient Data Fallback'],
      default: 'Holt-Winters',
    },
    modelVersion: {
      type: String,
      default: 'demand_forecast_v1',
    },
    status: {
      type: String,
      enum: ['SUCCESS', 'INSUFFICIENT_DATA'],
      default: 'SUCCESS',
    },
    metrics: {
      mae: { type: Number, default: 0 },
      rmse: { type: Number, default: 0 },
      smape: { type: Number, default: 0 },
    },
    timeSeries: [forecastPointSchema],
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
    collection: 'tbl_Demand_Forecast',
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

const DemandForecast =
  mongoose.models.DemandForecast || mongoose.model('DemandForecast', demandForecastSchema);

module.exports = DemandForecast;
