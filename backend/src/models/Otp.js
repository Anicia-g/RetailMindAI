const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema(
  {
    identifier: {
      type: String,
      required: true,
      index: true,
    },
    otpHash: {
      type: String,
      required: true,
    },
    purpose: {
      type: String,
      enum: ['VERIFICATION', 'LOGIN', 'REGISTRATION', 'PASSWORD_RESET'],
      default: 'VERIFICATION',
    },
    attempts: {
      type: Number,
      default: 0,
    },
    maxAttempts: {
      type: Number,
      default: 5,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    lastSentAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // MongoDB TTL index to automatically purge expired OTP documents
    },
  },
  {
    timestamps: true,
  }
);

const Otp = mongoose.models.Otp || mongoose.model('Otp', otpSchema);

module.exports = Otp;
