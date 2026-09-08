const mongoose = require('mongoose');

const chatbotHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ['ADMIN', 'SELLER', 'CUSTOMER'],
      required: true,
      index: true,
    },
    query: {
      type: String,
      required: true,
    },
    response: {
      type: String,
      required: true,
    },
    intent: {
      type: String,
      default: 'GENERAL_QUERY',
    },
    context: {
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
    collection: 'tbl_Chatbot_History',
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

const ChatbotHistory =
  mongoose.models.ChatbotHistory || mongoose.model('ChatbotHistory', chatbotHistorySchema);

module.exports = ChatbotHistory;
