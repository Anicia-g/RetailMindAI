const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'User name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required'],
      select: false, // Do not expose password by default
    },
    role: {
      type: String,
      enum: ['ADMIN', 'SELLER', 'CUSTOMER'],
      default: 'CUSTOMER',
      required: true,
      index: true,
    },
    storeId: {
      type: String,
      ref: 'Store',
      default: null,
    },
    store: {
      type: String,
      default: 'Headquarters (HQ)',
    },
    department: {
      type: String,
      default: 'General',
    },
    permissions: {
      type: [String],
      default: [],
    },
    avatar: {
      type: String,
      default: 'RM',
    },
    image: {
      type: String,
      default: null,
    },
    rank: {
      type: Number,
      default: 0,
    },
    salesAmount: {
      type: Number,
      default: 0,
    },
    ordersHandled: {
      type: Number,
      default: 0,
    },
    targetAchievement: {
      type: Number,
      default: 100,
    },
    rating: {
      type: Number,
      default: 5.0,
    },
    performanceScore: {
      type: Number,
      default: 90,
    },
    badge: {
      type: String,
      default: 'Active Member',
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
        ret.id = ret._id ? ret._id.toString() : ret.id;
        delete ret.passwordHash;
        delete ret.__v;
        return ret;
      },
    },
  }
);

userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.passwordHash) return false;
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

userSchema.pre('save', function (next) {
  this.dte_Modified_Date = new Date();
  next();
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

module.exports = User;
