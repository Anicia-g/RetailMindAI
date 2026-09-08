const mongoose = require('mongoose');

const customerSegmentSchema = new mongoose.Schema(
  {
    customerId: {
      type: String,
      required: true,
      index: true,
    },
    customerName: {
      type: String,
      default: '',
    },
    cluster: {
      type: Number,
      required: true,
    },
    segment: {
      type: String,
      enum: ['VIP', 'Loyal', 'Growing', 'Occasional', 'At Risk', 'Inactive'],
      required: true,
      index: true,
    },
    recency: {
      type: Number,
      required: true,
    },
    frequency: {
      type: Number,
      required: true,
    },
    monetary: {
      type: Number,
      required: true,
    },
    confidenceScore: {
      type: Number,
      default: 0.85,
    },
    recommendation: {
      type: String,
      default: '',
    },
    modelVersion: {
      type: String,
      default: 'customer_segmentation_v1',
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
    collection: 'tbl_Customer_Segment',
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

const CustomerSegment =
  mongoose.models.CustomerSegment || mongoose.model('CustomerSegment', customerSegmentSchema);

module.exports = CustomerSegment;
