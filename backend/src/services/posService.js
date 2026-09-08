const mongoose = require('mongoose');
const Product = require('../models/Product');
const Inventory = require('../models/Inventory');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const Customer = require('../models/Customer');
const User = require('../models/User');
const StockTransaction = require('../models/StockTransaction');

class PosService {
  async processSale({
    customerId = null,
    customerName = 'Walk-in Shopper',
    sellerId = null,
    sellerName = null,
    storeId = 'store-01',
    storeName = 'Indiranagar Flagship (Store 01)',
    items = [],
    paymentMethod = 'UPI',
    discountAmount = 0,
  }, currentUser = null) {
    if (!items || items.length === 0) {
      throw new Error('Cannot process POS sale: Order items list is empty.');
    }

    // Identify Seller details
    const activeSellerId = sellerId || currentUser?.id || 'emp-001';
    const activeSellerName = sellerName || currentUser?.name || 'Priya Sharma';
    const activeStoreId = storeId || currentUser?.storeId || 'store-01';
    const activeStoreName = storeName || currentUser?.store || 'Indiranagar Flagship (Store 01)';

    let subtotal = 0;
    let totalDiscount = Number(discountAmount) || 0;
    let totalTax = 0;
    const validatedItems = [];

    // 1. Validate all items and current stock before making any mutations
    for (const item of items) {
      const pId = item.productId || item.id;
      const product = await Product.findOne({
        $or: [{ productId: pId }, { sku: pId }, { _id: pId.match(/^[0-9a-fA-F]{24}$/) ? pId : null }],
        bit_IsActive: true,
      });

      if (!product) {
        throw new Error(`Product '${item.name || pId}' was not found in catalog.`);
      }

      const qty = Number(item.qty || item.quantity || 1);
      if (qty <= 0) {
        throw new Error(`Invalid quantity ${qty} for product ${product.name}`);
      }

      if (product.stock < qty) {
        throw new Error(`Insufficient inventory for '${product.name}'. Available: ${product.stock}, Requested: ${qty}`);
      }

      const itemPrice = Number(item.price || product.price);
      const itemOrigPrice = Number(item.originalPrice || product.originalPrice || itemPrice);
      const itemTotal = itemPrice * qty;
      const itemDiscount = Math.max(0, (itemOrigPrice - itemPrice) * qty);

      subtotal += itemTotal;
      totalDiscount += itemDiscount;
      totalTax += Number(product.tax || 0) * qty;

      validatedItems.push({
        productDoc: product,
        productId: product.productId,
        name: product.name,
        sku: product.sku,
        qty,
        price: itemPrice,
        originalPrice: itemOrigPrice,
        discount: itemDiscount,
        total: itemTotal,
        image: product.image || item.image || '',
      });
    }

    const totalAmount = Math.max(0, subtotal + totalTax);
    const orderNumber = `ORD-POS-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
    const orderId = `ord-${Date.now()}`;

    // 2. Resolve Customer if provided
    let customerDoc = null;
    let resolvedCustomerName = customerName;
    if (customerId) {
      customerDoc = await Customer.findOne({
        $or: [{ customerId }, { email: customerId }, { _id: customerId.match(/^[0-9a-fA-F]{24}$/) ? customerId : null }],
      });
      if (customerDoc) {
        resolvedCustomerName = customerDoc.name;
      }
    }

    // 3. Create the Order document
    const order = await Order.create({
      orderId,
      orderNumber,
      customerId: customerDoc?.customerId || customerId || 'cust-walkin',
      customerName: resolvedCustomerName,
      sellerId: activeSellerId,
      sellerName: activeSellerName,
      storeId: activeStoreId,
      store: activeStoreName,
      items: validatedItems.map(({ productDoc, ...rest }) => rest),
      itemsCount: validatedItems.reduce((acc, i) => acc + i.qty, 0),
      subtotal,
      discount: totalDiscount,
      tax: totalTax,
      totalAmount,
      orderType: 'POS_SALE',
      status: 'Completed',
      paymentStatus: 'Paid',
      paymentMethod,
      deliveryAddress: 'Walk-in Store POS',
      date: new Date().toISOString().replace('T', ' ').slice(0, 16),
      txt_Created_By: activeSellerName,
    });

    // 4. Create the Payment document
    const payment = await Payment.create({
      paymentId: `PAY-${Date.now().toString().slice(-6)}`,
      orderId: order.orderId,
      customerName: resolvedCustomerName,
      customerId: customerDoc?.customerId || null,
      method: paymentMethod,
      amount: totalAmount,
      status: 'Completed',
      gateway: paymentMethod === 'CASH' ? 'In-Store Cash Counter' : 'POS Card / UPI Terminal',
      paidAt: new Date(),
      txt_Created_By: activeSellerName,
    });

    // 5. Decrement inventory and log StockTransaction for each item
    for (const item of validatedItems) {
      const product = item.productDoc;
      const previousStock = product.stock;
      const newStock = Math.max(0, previousStock - item.qty);

      product.stock = newStock;
      product.unitsSold = (product.unitsSold || 0) + item.qty;
      product.revenue = (product.revenue || 0) + item.total;
      product.stockStatus = newStock <= product.reorderLevel / 2
        ? 'Critical'
        : newStock <= product.reorderLevel
        ? 'Low Stock'
        : 'Healthy';
      product.expectedStockoutDays = product.dailyVelocity > 0
        ? Number((newStock / product.dailyVelocity).toFixed(1))
        : 30;
      product.txt_Modified_By = activeSellerName;
      product.dte_Modified_Date = new Date();
      await product.save();

      // Update Inventory
      await Inventory.findOneAndUpdate(
        { productId: product.productId },
        {
          currentStock: newStock,
          status: product.stockStatus,
          daysRemaining: product.expectedStockoutDays,
          lastRestocked: new Date().toISOString().split('T')[0],
        }
      );

      // Log StockTransaction
      await StockTransaction.create({
        transactionId: `stx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        productId: product.productId,
        sku: product.sku,
        storeId: activeStoreId,
        type: 'SALE',
        quantity: -item.qty,
        previousStock,
        newStock,
        referenceId: order.orderId,
        performedBy: activeSellerName,
        reason: `POS Sale #${order.orderNumber}`,
      });
    }

    // 6. Update Customer stats if customer was resolved
    if (customerDoc) {
      customerDoc.orders = (customerDoc.orders || 0) + 1;
      customerDoc.totalSpent = (customerDoc.totalSpent || 0) + totalAmount;
      customerDoc.aov = Math.round(customerDoc.totalSpent / customerDoc.orders);
      customerDoc.frequency = customerDoc.orders;
      customerDoc.monetary = customerDoc.totalSpent;
      customerDoc.recencyDays = 0;
      customerDoc.lastPurchase = 'Just now (Store POS)';
      customerDoc.smartCoins = (customerDoc.smartCoins || 0) + Math.floor(totalAmount * 0.05);
      customerDoc.recentPurchases.unshift({
        id: order.orderId,
        date: new Date().toISOString().split('T')[0],
        items: validatedItems.map((i) => `${i.name} (${i.qty}x)`).join(', ').slice(0, 80),
        total: totalAmount,
        payment: paymentMethod,
      });
      if (customerDoc.recentPurchases.length > 10) {
        customerDoc.recentPurchases = customerDoc.recentPurchases.slice(0, 10);
      }
      await customerDoc.save();
    }

    // 7. Update Seller stats if seller exists in User model
    try {
      const sellerUser = await User.findOne({
        $or: [{ _id: activeSellerId.match(/^[0-9a-fA-F]{24}$/) ? activeSellerId : null }, { email: activeSellerId }, { name: activeSellerName }],
      });
      if (sellerUser) {
        sellerUser.salesAmount = (sellerUser.salesAmount || 0) + totalAmount;
        sellerUser.ordersHandled = (sellerUser.ordersHandled || 0) + 1;
        await sellerUser.save();
      }
    } catch (e) {}

    return {
      success: true,
      order,
      payment,
      message: `Sale #${order.orderNumber} completed successfully.`,
    };
  }
}

module.exports = new PosService();
