const mongoose = require('mongoose');

const aiRecommendationSchema = new mongoose.Schema(
  {
    recommendationType: {
      type: String,
      enum: [
        'REORDER',
        'DISCOUNT',
        'PRODUCT_RECOMMENDATION',
        'CUSTOMER_ACTION',
        'INVENTORY_ACTION',
        'PROMOTION',
        'GENERAL_INSIGHT',
        'DISCOUNT_MARKDOWN',
        'BUNDLE_CROSS_SELL',
        'PERSONALIZED',
      ],
      required: true,
      index: true,
    },
    productId: {
      type: String,
      default: '',
      index: true,
    },
    productName: {
      type: String,
      default: '',
    },
    storeId: {
      type: String,
      default: '',
      index: true,
    },
    customerId: {
      type: String,
      default: '',
      index: true,
    },
    priority: {
      type: String,
      enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'],
      default: 'MEDIUM',
      index: true,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'APPLIED', 'DISMISSED', 'PENDING'],
      default: 'ACTIVE',
      index: true,
    },
    source: {
      type: String,
      default: 'AI_INTELLIGENCE_ENGINE',
    },
    recommendation: {
      type: String,
      default: '',
    },
    reason: {
      type: String,
      default: '',
    },
    explanation: {
      type: String,
      default: '',
    },
    currentStock: {
      type: Number,
      default: 0,
    },
    suggestedReorderQuantity: {
      type: Number,
      default: 0,
    },
    daysRemaining: {
      type: Number,
      default: 0,
    },
    recommendedDiscount: {
      type: Number,
      default: 0,
    },
    discountFormatted: {
      type: String,
      default: '0%',
    },
    modelUsed: {
      type: String,
      default: 'C4.5',
    },
    confidence: {
      type: Number,
      default: 0.9,
    },
    importantFactors: [
      {
        type: String,
      },
    ],
    decisionPath: [
      {
        type: String,
      },
    ],
    recommendedProducts: [
      {
        productId: String,
        name: String,
        category: String,
        price: Number,
        confidence: Number,
        lift: Number,
      },
    ],
    metrics: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    modelVersion: {
      type: String,
      default: 'recommendation_v1',
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
    collection: 'tbl_AI_Recommendation',
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

const AiRecommendation =
  mongoose.models.AiRecommendation || mongoose.model('AiRecommendation', aiRecommendationSchema);

module.exports = AiRecommendation;
