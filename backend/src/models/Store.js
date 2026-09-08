const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema(
  {
    storeId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Store name is required'],
      trim: true,
    },
    code: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    manager: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      default: '',
    },
    employeesCount: {
      type: Number,
      default: 0,
    },
    monthlySales: {
      type: Number,
      default: 0,
    },
    inventoryHealth: {
      type: String,
      enum: ['Healthy', 'Low Stock', 'Critical', 'Overstock'],
      default: 'Healthy',
    },
    stockoutItemsCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'Renovation'],
      default: 'Active',
    },
    address: {
      type: String,
      default: '',
    },
    aiAlert: {
      type: String,
      default: null,
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
        ret.id = ret.storeId || (ret._id ? ret._id.toString() : ret.id);
        delete ret.__v;
        return ret;
      },
    },
  }
);

const Store = mongoose.models.Store || mongoose.model('Store', storeSchema);

module.exports = Store;
