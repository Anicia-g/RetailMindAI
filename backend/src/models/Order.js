const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    sku: {
      type: String,
      default: '',
    },
    qty: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1'],
    },
    price: {
      type: Number,
      required: true,
    },
    originalPrice: {
      type: Number,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
      required: true,
    },
    image: {
      type: String,
      default: '',
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    customerId: {
      type: String,
      default: 'cust-001',
      index: true,
    },
    customerName: {
      type: String,
      default: 'Guest Customer',
    },
    avatar: {
      type: String,
      default: null,
    },
    sellerId: {
      type: String,
      default: null,
      index: true,
    },
    sellerName: {
      type: String,
      default: null,
    },
    storeId: {
      type: String,
      default: 'store-01',
      index: true,
    },
    store: {
      type: String,
      default: 'Indiranagar Flagship (Store 01)',
    },
    items: [orderItemSchema],
    itemsCount: {
      type: Number,
      default: 0,
    },
    subtotal: {
      type: Number,
      required: true,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },
    tax: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      default: 0,
    },
    orderType: {
      type: String,
      enum: ['ONLINE', 'POS_SALE'],
      default: 'POS_SALE',
    },
    status: {
      type: String,
      enum: ['Processing', 'Completed', 'Cancelled', 'Delivered', 'Pending'],
      default: 'Completed',
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
      default: 'Paid',
    },
    paymentMethod: {
      type: String,
      default: 'UPI',
    },
    deliveryAddress: {
      type: String,
      default: 'In-Store Pickup / Walk-in',
    },
    date: {
      type: String,
      default: () => new Date().toISOString().replace('T', ' ').slice(0, 16),
      index: true,
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
        ret.id = ret.orderId || (ret._id ? ret._id.toString() : ret.id);
        delete ret.__v;
        return ret;
      },
    },
  }
);

orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ storeId: 1, status: 1, createdAt: -1 });
orderSchema.index({ customerId: 1, status: 1 });
orderSchema.index({ sellerId: 1, status: 1, createdAt: -1 });
orderSchema.index({ 'items.productId': 1, status: 1, createdAt: -1 });

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

module.exports = Order;
