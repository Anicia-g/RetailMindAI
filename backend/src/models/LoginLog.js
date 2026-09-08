const mongoose = require('mongoose');

const loginLogSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      default: '',
      index: true,
    },
    email: {
      type: String,
      required: true,
      index: true,
    },
    role: {
      type: String,
      default: 'CUSTOMER',
      index: true,
    },
    status: {
      type: String,
      enum: ['SUCCESS', 'FAILED'],
      required: true,
      index: true,
    },
    reason: {
      type: String,
      default: '',
    },
    ipAddress: {
      type: String,
      default: '',
    },
    userAgent: {
      type: String,
      default: '',
    },
    loginAt: {
      type: Date,
      default: Date.now,
      index: true,
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
    collection: 'tbl_Login_Log',
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

const LoginLog = mongoose.models.LoginLog || mongoose.model('LoginLog', loginLogSchema);

module.exports = LoginLog;
