const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema(
  {
    supplierId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Supplier name is required'],
      trim: true,
      index: true,
    },
    contactPerson: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      default: 'Groceries & Gourmet',
    },
    rating: {
      type: Number,
      default: 4.5,
    },
    leadTimeDays: {
      type: Number,
      default: 3,
    },
    activeOrders: {
      type: Number,
      default: 0,
    },
    totalOrdersCompleted: {
      type: Number,
      default: 0,
    },
    reliabilityScore: {
      type: String,
      default: '95%',
    },
    address: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'Under Review'],
      default: 'Active',
    },
    suppliedProducts: {
      type: [String],
      default: [],
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
        ret.id = ret.supplierId || (ret._id ? ret._id.toString() : ret.id);
        delete ret.__v;
        return ret;
      },
    },
  }
);

const Supplier = mongoose.models.Supplier || mongoose.model('Supplier', supplierSchema);

module.exports = Supplier;
