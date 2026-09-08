const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: String,
      default: 'all',
      index: true,
    },
    role: {
      type: String,
      enum: ['ADMIN', 'SELLER', 'CUSTOMER', 'ALL'],
      default: 'ALL',
      index: true,
    },
    storeId: {
      type: String,
      default: null,
      index: true,
    },
    type: {
      type: String,
      enum: [
        'LOW_STOCK',
        'HIGH_STOCK_RISK',
        'STOCK_OUTLOOK',
        'REORDER_RECOMMENDATION',
        'ANOMALY_ALERT',
        'SALES_INSIGHT',
        'CUSTOMER_OFFER',
        'ORDER_UPDATE',
        'SYSTEM_NOTIFICATION',
      ],
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    priority: {
      type: String,
      enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'],
      default: 'MEDIUM',
      index: true,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['UNREAD', 'READ', 'ARCHIVED'],
      default: 'UNREAD',
      index: true,
    },
    actionUrl: {
      type: String,
      default: '',
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
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
    collection: 'tbl_Notification',
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

const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);

module.exports = Notification;
