const orderRepository = require('../repositories/orderRepository');
const orderItemRepository = require('../repositories/orderItemRepository');
const productRepository = require('../repositories/productRepository');
const inventoryRepository = require('../repositories/inventoryRepository');
const paymentRepository = require('../repositories/paymentRepository');
const paymentMethodRepository = require('../repositories/paymentMethodRepository');
const customerRepository = require('../repositories/customerRepository');
const stockTransactionRepository = require('../repositories/stockTransactionRepository');
const { withTransaction } = require('../config/db');

class OrderService {
  async getAllOrders(filters = {}) {
    const page = parseInt(filters.page || '1', 10);
    const limit = parseInt(filters.limit || '50', 10);

    const [orders, total] = await Promise.all([
      orderRepository.findAllOrders({ ...filters, page, limit }),
      orderRepository.countOrders(filters),
    ]);

    return { orders, total, page, limit };
  }

  async getOrderById(id) {
    const order = await orderRepository.findOrderById(id);
    if (!order) {
      throw new Error(`Order '${id}' not found.`);
    }
    return order;
  }

  async createCustomerOrder(data, user) {
    const {
      items = [],
      paymentMethod = 'UPI',
      deliveryAddress = 'Flat 402, Palm Heights, Indiranagar, Bangalore',
      store = 'Indiranagar Flagship (Store 01)',
    } = data;

    if (!items || items.length === 0) {
      throw new Error('Shopping cart is empty.');
    }

    const pmRecord = await paymentMethodRepository.findByCodeOrName(paymentMethod);
    const paymentMethodId = pmRecord?.int_Payment_Method_Id || 1;

    let customerRecord = null;
    if (user?.email || user?.id) {
      customerRecord = await customerRepository.findByEmailOrPhone(user.email || user.id);
    }
    const customerId = customerRecord?.int_Customer_Id || (user?.userId || 1);
    const customerName = customerRecord
      ? `${customerRecord.txt_First_Name} ${customerRecord.txt_Last_Name || ''}`.trim()
      : (user?.name || 'Online Customer');

    let subtotal = 0;
    let totalDiscount = 0;
    const validatedItems = [];

    for (const item of items) {
      const pId = item.productId || item.id;
      const product = await productRepository.findProductById(pId);
      const qty = Number(item.quantity || item.qty || 1);
      const price = product ? product.price : Number(item.price || 50);
      const originalPrice = product ? product.originalPrice : Number(item.originalPrice || price);
      const total = price * qty;
      const discount = Math.max(0, (originalPrice - price) * qty);

      subtotal += total;
      totalDiscount += discount;

      validatedItems.push({
        product,
        productId: product ? product.id : pId,
        internalProductId: product ? product.id : 1,
        name: product ? product.name : item.name,
        sku: product ? product.sku : 'ONLINE-SKU',
        qty,
        price,
        originalPrice,
        discount,
        total,
        image: product?.image || item.image || '',
      });
    }

    const orderNumber = `ORD-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    return await withTransaction(async (conn) => {
      // 1. Create tbl_Order
      const createdOrder = await orderRepository.createOrder(
        {
          txt_Order_Number: orderNumber,
          int_Store_Id: 1,
          int_Customer_Id: customerId,
          int_User_Id: 1,
          dte_Order_Date: new Date(),
          txt_Order_Type: 'ONLINE',
          txt_Order_Status: 'Processing',
          dec_Subtotal_Amount: subtotal,
          dec_Discount_Amount: totalDiscount,
          dec_Tax_Amount: 0,
          dec_Shipping_Amount: 0,
          dec_Total_Amount: subtotal,
          dec_Paid_Amount: subtotal,
          dec_Due_Amount: 0,
          int_Payment_Method_Id: paymentMethodId,
          txt_Payment_Status: 'Paid',
          txt_Delivery_Address: deliveryAddress,
          txt_Sales_Channel: 'ONLINE_STOREFRONT',
        },
        customerName,
        conn
      );

      // 2. Create tbl_Order_Item rows and adjust inventory
      for (const item of validatedItems) {
        await orderItemRepository.createOrderItem(
          {
            int_Order_Id: createdOrder.int_Order_Id,
            int_Product_Id: item.internalProductId,
            int_Quantity: item.qty,
            dec_Unit_Price: item.price,
            dec_Discount_Amount: item.discount,
            dec_Tax_Amount: 0,
            dec_Total_Amount: item.total,
            int_Unit_Id: item.product?.unitId || 1,
          },
          customerName,
          conn
        );

        if (item.product) {
          const inv = await inventoryRepository.findByProductAndStore(item.internalProductId, 1, conn);
          const currentStock = inv ? Number(inv.int_Quantity_On_Hand) : item.product.stock;
          const newStock = Math.max(0, currentStock - item.qty);

          await inventoryRepository.upsertStock(item.internalProductId, 1, newStock, customerName, conn);

          await stockTransactionRepository.createTransaction(
            {
              productId: item.internalProductId,
              storeId: 1,
              type: 'SALE',
              quantity: -item.qty,
              referenceNumber: orderNumber,
              referenceType: 'ONLINE_SALE',
              referenceId: createdOrder.int_Order_Id,
              unitCost: item.product.costPrice || 0,
              performedByUserId: 1,
              remarks: 'Customer Online Storefront Order',
              user: customerName,
            },
            conn
          );
        }
      }

      // 3. Create tbl_Payment
      await paymentRepository.createPayment(
        {
          orderId: createdOrder.int_Order_Id,
          paymentMethodId,
          amount: subtotal,
          status: 'Completed',
          gateway: 'Razorpay Online Gateway',
          receivedByUserId: 1,
          storeId: 1,
          user: customerName,
        },
        conn
      );

      // 4. Update customer stats
      if (customerRecord) {
        await customerRepository.updateCustomerStats(customerRecord.int_Customer_Id, subtotal, conn);
      }

      return await orderRepository.findOrderById(createdOrder.int_Order_Id, conn);
    });
  }

  async updateOrderStatus(id, status, user = null) {
    const updated = await orderRepository.updateOrderStatus(id, status, user?.name || 'system');
    if (!updated) {
      throw new Error(`Order '${id}' not found.`);
    }
    return updated;
  }
}

module.exports = new OrderService();
