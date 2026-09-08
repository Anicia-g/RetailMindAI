const Order = require('../models/Order');
const Product = require('../models/Product');
const Inventory = require('../models/Inventory');
const Payment = require('../models/Payment');
const Customer = require('../models/Customer');
const StockTransaction = require('../models/StockTransaction');

class OrderService {
  async getAllOrders(filters = {}) {
    const query = { bit_IsActive: true };

    if (filters.search) {
      const q = filters.search.trim();
      query.$or = [
        { orderNumber: { $regex: q, $options: 'i' } },
        { customerName: { $regex: q, $options: 'i' } },
        { store: { $regex: q, $options: 'i' } },
      ];
    }

    if (filters.customerId) {
      query.customerId = filters.customerId;
    }

    if (filters.sellerId) {
      query.sellerId = filters.sellerId;
    }

    if (filters.storeId) {
      query.storeId = filters.storeId;
    }

    if (filters.status && filters.status !== 'All') {
      query.status = filters.status;
    }

    if (filters.orderType) {
      query.orderType = filters.orderType;
    }

    const page = parseInt(filters.page || '1', 10);
    const limit = parseInt(filters.limit || '50', 10);
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Order.countDocuments(query),
    ]);

    return { orders, total, page, limit };
  }

  async getOrderById(id) {
    return await Order.findOne({
      $or: [{ orderId: id }, { orderNumber: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
      bit_IsActive: true,
    });
  }

  async createCustomerOrder(data, user) {
    const { items = [], paymentMethod = 'UPI', deliveryAddress = 'Flat 402, Palm Heights, Indiranagar, Bangalore', store = 'Indiranagar Flagship (Store 01)' } = data;

    if (!items || items.length === 0) {
      throw new Error('Shopping cart is empty.');
    }

    let subtotal = 0;
    let totalDiscount = 0;
    const validatedItems = [];

    for (const item of items) {
      const pId = item.productId || item.id;
      const product = await Product.findOne({
        $or: [{ productId: pId }, { sku: pId }, { _id: pId.match(/^[0-9a-fA-F]{24}$/) ? pId : null }],
        bit_IsActive: true,
      });

      const qty = Number(item.quantity || item.qty || 1);
      const price = product ? product.price : (item.price || 50);
      const originalPrice = product ? product.originalPrice : (item.originalPrice || price);
      const total = price * qty;
      const discount = Math.max(0, (originalPrice - price) * qty);

      subtotal += total;
      totalDiscount += discount;

      validatedItems.push({
        productId: product ? product.productId : (pId || `prod-${Date.now()}`),
        name: product ? product.name : item.name,
        sku: product ? product.sku : 'ONLINE-SKU',
        qty,
        price,
        originalPrice,
        discount,
        total,
        image: product?.image || item.image || '',
      });

      // Decrement inventory if product was found
      if (product && product.stock >= qty) {
        const previousStock = product.stock;
        product.stock = Math.max(0, previousStock - qty);
        product.unitsSold = (product.unitsSold || 0) + qty;
        await product.save();

        await Inventory.findOneAndUpdate(
          { productId: product.productId },
          { currentStock: product.stock }
        );

        await StockTransaction.create({
          transactionId: `stx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          productId: product.productId,
          sku: product.sku,
          storeId: 'store-01',
          type: 'SALE',
          quantity: -qty,
          previousStock,
          newStock: product.stock,
          performedBy: user?.name || 'Online Customer',
          reason: 'Customer Online Storefront Order',
        });
      }
    }

    const orderNumber = `ORD-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const orderId = `ord-${Date.now()}`;

    const order = await Order.create({
      orderId,
      orderNumber,
      customerId: user?.id || 'cust-001',
      customerName: user?.name || 'Vikram Malhotra',
      storeId: 'store-01',
      store: store || 'Indiranagar Flagship (Store 01)',
      items: validatedItems,
      itemsCount: validatedItems.reduce((acc, i) => acc + i.qty, 0),
      subtotal,
      discount: totalDiscount,
      tax: 0,
      totalAmount: subtotal,
      orderType: 'ONLINE',
      status: 'Processing',
      paymentStatus: 'Paid',
      paymentMethod,
      deliveryAddress,
      date: new Date().toISOString().replace('T', ' ').slice(0, 16),
      txt_Created_By: user?.name || 'Online Customer',
    });

    await Payment.create({
      paymentId: `PAY-${Date.now().toString().slice(-6)}`,
      orderId: order.orderId,
      customerName: user?.name || 'Vikram Malhotra',
      customerId: user?.id || 'cust-001',
      method: paymentMethod,
      amount: subtotal,
      status: 'Completed',
      gateway: 'Razorpay Online Gateway',
      paidAt: new Date(),
    });

    return order;
  }

  async updateOrderStatus(id, status, user = null) {
    const order = await Order.findOneAndUpdate(
      { $or: [{ orderId: id }, { orderNumber: id }] },
      { status, txt_Modified_By: user?.name || 'system', dte_Modified_Date: new Date() },
      { new: true }
    );
    if (!order) throw new Error(`Order '${id}' not found.`);
    return order;
  }
}

module.exports = new OrderService();
