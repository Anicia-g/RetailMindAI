const mongoose = require('mongoose');

const customerPurchaseSchema = new mongoose.Schema(
  {
    id: String,
    date: String,
    items: String,
    total: Number,
    payment: String,
  },
  { _id: false }
);

const customerSchema = new mongoose.Schema(
  {
    customerId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    name: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
      index: true,
    },
    avatar: {
      type: String,
      default: null,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: {
      type: String,
      required: true,
      index: true,
    },
    orders: {
      type: Number,
      default: 0,
    },
    totalSpent: {
      type: Number,
      default: 0,
    },
    aov: {
      type: Number,
      default: 0,
    },
    lastPurchase: {
      type: String,
      default: 'Recently',
    },
    rank: {
      type: Number,
      default: 99,
    },
    tag: {
      type: String,
      default: 'Valued Customer',
    },
    segment: {
      type: String,
      enum: ['VIP', 'Loyal', 'Growing', 'Occasional', 'At Risk', 'Inactive'],
      default: 'Growing',
      index: true,
    },
    cluster: {
      type: String,
      default: 'Cluster 2: Loyal Regulars',
    },
    recencyDays: {
      type: Number,
      default: 0,
    },
    frequency: {
      type: Number,
      default: 1,
    },
    monetary: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'Dormant'],
      default: 'Active',
    },
    joinedDate: {
      type: String,
      default: () => new Date().toISOString().split('T')[0],
    },
    preferredStore: {
      type: String,
      default: 'Indiranagar Flagship (Store 01)',
    },
    storeId: {
      type: String,
      default: 'store-01',
      index: true,
    },
    assignedSeller: {
      type: String,
      default: 'Priya Sharma',
    },
    sellerId: {
      type: String,
      default: 'emp-001',
    },
    smartCoins: {
      type: Number,
      default: 150,
    },
    aiInsight: {
      type: String,
      default: '',
    },
    recommendedAction: {
      type: String,
      default: '',
    },
    recentPurchases: [customerPurchaseSchema],
    preferences: {
      whatsappOffers: {
        type: Boolean,
        default: true,
      },
      emailUpdates: {
        type: Boolean,
        default: true,
      },
      smsNotifications: {
        type: Boolean,
        default: false,
      },
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
        ret.id = ret.customerId || (ret._id ? ret._id.toString() : ret.id);
        delete ret.__v;
        return ret;
      },
    },
  }
);

const Customer = mongoose.models.Customer || mongoose.model('Customer', customerSchema);

module.exports = Customer;
