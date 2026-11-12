const productRepository = require('../repositories/productRepository');
const inventoryRepository = require('../repositories/inventoryRepository');
const orderRepository = require('../repositories/orderRepository');
const orderItemRepository = require('../repositories/orderItemRepository');
const paymentRepository = require('../repositories/paymentRepository');
const paymentMethodRepository = require('../repositories/paymentMethodRepository');
const customerRepository = require('../repositories/customerRepository');
const stockTransactionRepository = require('../repositories/stockTransactionRepository');
const storeRepository = require('../repositories/storeRepository');
const userRepository = require('../repositories/userRepository');
const { withTransaction } = require('../config/db');

class PosService {
  async processSale(
    {
      customerId = null,
      customerName = 'Walk-in Shopper',
      sellerId = null,
      sellerName = null,
      storeId = 'store-01',
      storeName = 'Indiranagar Flagship (Store 01)',
      items = [],
      paymentMethod = 'UPI',
      discountAmount = 0,
    },
    currentUser = null
  ) {
    if (!items || items.length === 0) {
      throw new Error('Cannot process POS sale: Order items list is empty.');
    }

    // Resolve store
    const storeNum = parseInt(String(storeId || currentUser?.storeId || '1').replace(/\D/g, ''), 10) || 1;
    const storeRecord = await storeRepository.findById(storeNum);
    const resolvedStoreName = storeRecord?.txt_Store_Name || storeName || currentUser?.store || 'Indiranagar Flagship (Store 01)';

    // Resolve seller / user
    const sellerNum = parseInt(String(sellerId || currentUser?.userId || currentUser?.id || '1').replace(/\D/g, ''), 10) || 1;
    const sellerRecord = await userRepository.findById(sellerNum);
    const resolvedSellerName = sellerRecord
      ? `${sellerRecord.txt_First_Name} ${sellerRecord.txt_Last_Name || ''}`.trim()
      : (sellerName || currentUser?.name || 'Priya Sharma');

    // Resolve customer if provided
    let customerRecord = null;
    if (customerId) {
      customerRecord = await customerRepository.findByIdOrCode(customerId);
    }
    const resolvedCustomerName = customerRecord
      ? `${customerRecord.txt_First_Name} ${customerRecord.txt_Last_Name || ''}`.trim()
      : customerName;

    // Resolve payment method
    const pmRecord = await paymentMethodRepository.findByCodeOrName(paymentMethod);
    const paymentMethodId = pmRecord?.int_Payment_Method_Id || 1;

    // Validate items and calculate totals
    let subtotal = 0;
    let totalDiscount = Number(discountAmount) || 0;
    let totalTax = 0;
    const validatedItems = [];

    for (const item of items) {
      const pId = item.productId || item.id;
      const product = await productRepository.findProductById(pId);
      if (!product) {
        throw new Error(`Product '${item.name || pId}' was not found in catalog.`);
      }

      const qty = Number(item.qty || item.quantity || 1);
      if (qty <= 0) {
        throw new Error(`Invalid quantity ${qty} for product ${product.name}`);
      }

      // Check current stock in inventory
      const inv = await inventoryRepository.findByProductAndStore(product.id, storeNum);
      const availableStock = inv ? Number(inv.int_Quantity_On_Hand) : product.stock;
      if (availableStock < qty) {
        throw new Error(`Insufficient inventory for '${product.name}'. Available: ${availableStock}, Requested: ${qty}`);
      }

      const itemPrice = Number(item.price || product.price);
      const itemOrigPrice = Number(item.originalPrice || product.originalPrice || itemPrice);
      const itemTotal = itemPrice * qty;
      const itemDiscount = Math.max(0, (itemOrigPrice - itemPrice) * qty);

      subtotal += itemTotal;
      totalDiscount += itemDiscount;
      totalTax += Number(product.tax || 0) * qty;

      validatedItems.push({
        product,
        productId: product.id,
        internalProductId: product.id,
        name: product.name,
        sku: product.sku,
        qty,
        price: itemPrice,
        originalPrice: itemOrigPrice,
        discount: itemDiscount,
        total: itemTotal,
        image: product.image || item.image || '',
        currentStock: availableStock,
      });
    }

    const totalAmount = Math.max(0, subtotal + totalTax);
    const orderNumber = `ORD-POS-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    return await withTransaction(async (conn) => {
      // 1. Create tbl_Order
      const createdOrder = await orderRepository.createOrder(
        {
          txt_Order_Number: orderNumber,
          int_Store_Id: storeNum,
          int_Customer_Id: customerRecord?.int_Customer_Id || null,
          int_User_Id: sellerNum,
          dte_Order_Date: new Date(),
          txt_Order_Type: 'POS_SALE',
          txt_Order_Status: 'Completed',
          dec_Subtotal_Amount: subtotal,
          dec_Discount_Amount: totalDiscount,
          dec_Tax_Amount: totalTax,
          dec_Shipping_Amount: 0,
          dec_Total_Amount: totalAmount,
          dec_Paid_Amount: totalAmount,
          dec_Due_Amount: 0,
          int_Payment_Method_Id: paymentMethodId,
          txt_Payment_Status: 'Paid',
          txt_Delivery_Address: 'Walk-in Store POS',
          txt_Sales_Channel: 'POS',
        },
        resolvedSellerName,
        conn
      );

      // 2. Create tbl_Order_Item rows
      for (const item of validatedItems) {
        await orderItemRepository.createOrderItem(
          {
            int_Order_Id: createdOrder.int_Order_Id,
            int_Product_Id: item.internalProductId,
            int_Quantity: item.qty,
            dec_Unit_Price: item.price,
            dec_Discount_Amount: item.discount,
            dec_Tax_Amount: (item.product.tax || 0) * item.qty,
            dec_Total_Amount: item.total,
            dec_Unit_Cost: item.product.costPrice || 0,
            int_Unit_Id: item.product.unitId || 1,
          },
          resolvedSellerName,
          conn
        );

        // 3. Decrement Inventory stock
        const newStock = Math.max(0, item.currentStock - item.qty);
        await inventoryRepository.upsertStock(item.internalProductId, storeNum, newStock, resolvedSellerName, conn);

        // 4. Record immutable StockTransaction
        await stockTransactionRepository.createTransaction(
          {
            productId: item.internalProductId,
            storeId: storeNum,
            type: 'SALE',
            quantity: -item.qty,
            referenceNumber: orderNumber,
            referenceType: 'POS_SALE',
            referenceId: createdOrder.int_Order_Id,
            unitCost: item.product.costPrice || 0,
            performedByUserId: sellerNum,
            remarks: `POS Sale #${orderNumber}`,
            user: resolvedSellerName,
          },
          conn
        );
      }

      // 5. Create tbl_Payment
      const createdPayment = await paymentRepository.createPayment(
        {
          orderId: createdOrder.int_Order_Id,
          paymentMethodId,
          amount: totalAmount,
          status: 'Completed',
          gateway: paymentMethod === 'CASH' ? 'In-Store Cash Counter' : 'POS Card / UPI Terminal',
          receivedByUserId: sellerNum,
          storeId: storeNum,
          user: resolvedSellerName,
        },
        conn
      );

      // 6. Update customer statistics if registered
      if (customerRecord) {
        await customerRepository.updateCustomerStats(customerRecord.int_Customer_Id, totalAmount, conn);
      }

      // 7. Load populated order DTO
      const orderDTO = await orderRepository.findOrderById(createdOrder.int_Order_Id, conn);

      return {
        success: true,
        order: orderDTO,
        payment: paymentRepository.toDTO(createdPayment),
        message: `Sale #${orderNumber} completed successfully.`,
      };
    });
  }
}

module.exports = new PosService();
