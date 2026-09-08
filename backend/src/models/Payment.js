const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    paymentId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    orderId: {
      type: String,
      required: true,
      index: true,
    },
    customerName: {
      type: String,
      default: 'Valued Customer',
    },
    customerId: {
      type: String,
      default: null,
    },
    method: {
      type: String,
      required: true,
      default: 'UPI',
    },
    amount: {
      type: Number,
      required: true,
    },
    date: {
      type: String,
      default: () => new Date().toISOString().replace('T', ' ').slice(0, 16),
    },
    status: {
      type: String,
      enum: ['Completed', 'Pending', 'Failed', 'Refunded'],
      default: 'Completed',
      index: true,
    },
    gateway: {
      type: String,
      default: 'Razorpay Enterprise',
    },
    referenceId: {
      type: String,
      default: () => `rzp_live_${Math.random().toString(36).substring(2, 10)}`,
    },
    paidAt: {
      type: Date,
      default: Date.now,
    },
    // Audit fields
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
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        ret.id = ret.paymentId || (ret._id ? ret._id.toString() : ret.id);
        delete ret.__v;
        return ret;
      },
    },
  }
);

paymentSchema.index({ status: 1, paidAt: -1 });
paymentSchema.index({ method: 1, status: 1 });

const Payment = mongoose.models.Payment || mongoose.model('Payment', paymentSchema);

module.exports = Payment;
