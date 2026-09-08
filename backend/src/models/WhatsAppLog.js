const mongoose = require('mongoose');

const whatsAppLogSchema = new mongoose.Schema(
  {
    recipient: {
      type: String,
      required: true,
      index: true,
    },
    customerId: {
      type: String,
      default: '',
      index: true,
    },
    customerName: {
      type: String,
      default: '',
    },
    template: {
      type: String,
      default: 'supermarket_personalized_offer',
    },
    messageBody: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['QUEUED', 'SENT', 'DELIVERED', 'FAILED'],
      default: 'SENT',
      index: true,
    },
    provider: {
      type: String,
      enum: ['MOCK_GATEWAY', 'WHATSAPP_BUSINESS_CLOUD_API'],
      default: 'MOCK_GATEWAY',
    },
    isMock: {
      type: Boolean,
      default: true,
    },
    errorMessage: {
      type: String,
      default: null,
    },
    sentAt: {
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
  },
  {
    collection: 'tbl_WhatsApp_Log',
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

const WhatsAppLog = mongoose.models.WhatsAppLog || mongoose.model('WhatsAppLog', whatsAppLogSchema);

module.exports = WhatsAppLog;
