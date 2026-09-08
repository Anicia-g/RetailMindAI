const mongoose = require('mongoose');

const poItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    sku: { type: String, default: '' },
    quantity: { type: Number, required: true },
    unitCost: { type: Number, required: true },
    total: { type: Number, required: true },
    reason: { type: String, default: '' },
  },
  { _id: false }
);

const purchaseOrderSchema = new mongoose.Schema(
  {
    poId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    poNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    supplier: {
      type: String,
      required: true,
    },
    supplierId: {
      type: String,
      required: true,
      index: true,
    },
    storeId: {
      type: String,
      default: 'store-01',
    },
    orderDate: {
      type: String,
      default: () => new Date().toISOString().split('T')[0],
    },
    expectedDelivery: {
      type: String,
      default: () => {
        const d = new Date();
        d.setDate(d.getDate() + 3);
        return d.toISOString().split('T')[0];
      },
    },
    totalCost: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['Pending Approval', 'In Transit', 'Delivered', 'Cancelled'],
      default: 'Pending Approval',
      index: true,
    },
    isAiGenerated: {
      type: Boolean,
      default: false,
    },
    items: [poItemSchema],
    notes: {
      type: String,
      default: '',
    },
    createdBy: {
      type: String,
      default: 'Admin User',
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
        ret.id = ret.poId || (ret._id ? ret._id.toString() : ret.id);
        delete ret.__v;
        return ret;
      },
    },
  }
);

const PurchaseOrder =
  mongoose.models.PurchaseOrder || mongoose.model('PurchaseOrder', purchaseOrderSchema);

module.exports = PurchaseOrder;
