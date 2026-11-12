const purchaseOrderRepository = require('../repositories/purchaseOrderRepository');
const purchaseOrderItemRepository = require('../repositories/purchaseOrderItemRepository');
const goodsReceiptRepository = require('../repositories/goodsReceiptRepository');
const productRepository = require('../repositories/productRepository');
const inventoryRepository = require('../repositories/inventoryRepository');
const stockTransactionRepository = require('../repositories/stockTransactionRepository');
const supplierRepository = require('../repositories/supplierRepository');
const { withTransaction } = require('../config/db');

class PurchaseOrderService {
  async getAllPurchaseOrders(filters = {}) {
    return await purchaseOrderRepository.findAllPOs(filters);
  }

  async getPurchaseOrderById(id) {
    const po = await purchaseOrderRepository.findPOById(id);
    if (!po) {
      throw new Error(`Purchase order '${id}' not found.`);
    }
    return po;
  }

  async createPurchaseOrder(data, user = null) {
    const poNumber = data.poNumber || `PO-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    let supRecord = null;
    if (data.supplierId) {
      supRecord = await supplierRepository.findByIdOrCode(data.supplierId);
    }
    const supplierId = supRecord?.int_Supplier_Id || (parseInt(data.supplierId, 10) || 1);

    const items = data.items || [];
    let totalCost = 0;
    const validatedItems = [];

    for (const item of items) {
      const pId = item.productId || item.id;
      const product = await productRepository.findProductById(pId);
      const qty = Number(item.quantity || item.qty || 1);
      const unitCost = Number(item.unitCost || product?.costPrice || (product?.price * 0.7) || 50);
      const lineTotal = Number(item.total || qty * unitCost);

      totalCost += lineTotal;
      validatedItems.push({
        product,
        productId: product ? product.id : pId,
        internalProductId: product ? product.id : 1,
        name: product ? product.name : item.name,
        sku: product ? product.sku : 'PO-SKU',
        quantity: qty,
        unitCost,
        lineTotal,
      });
    }

    return await withTransaction(async (conn) => {
      // 1. Create tbl_Purchase_Order
      const createdPO = await purchaseOrderRepository.createPO(
        {
          txt_PO_Number: poNumber,
          int_Supplier_Id: supplierId,
          int_Store_Id: 1,
          int_Warehouse_Id: 1,
          int_Created_By_User_Id: user?.userId || 1,
          dte_PO_Date: new Date(),
          dte_Expected_Delivery_Date: data.expectedDelivery ? new Date(data.expectedDelivery) : new Date(Date.now() + 7 * 86400000),
          txt_PO_Status: data.status || 'Pending',
          dec_Subtotal_Amount: totalCost,
          dec_Tax_Amount: 0,
          dec_Discount_Amount: 0,
          dec_Total_Amount: totalCost,
          txt_Payment_Terms: data.paymentTerms || 'Net 30',
        },
        user?.name || 'system',
        conn
      );

      // 2. Create tbl_Purchase_Order_Item rows
      for (const item of validatedItems) {
        await purchaseOrderItemRepository.createPOItem(
          {
            int_Purchase_Order_Id: createdPO.int_Purchase_Order_Id,
            int_Product_Id: item.internalProductId,
            int_Ordered_Quantity: item.quantity,
            int_Received_Quantity: 0,
            dec_Unit_Cost: item.unitCost,
            dec_Subtotal_Amount: item.lineTotal,
            dec_Total_Amount: item.lineTotal,
            txt_Item_Status: 'Pending',
          },
          user?.name || 'system',
          conn
        );
      }

      return await purchaseOrderRepository.findPOById(createdPO.int_Purchase_Order_Id, conn);
    });
  }

  async updatePurchaseOrderStatus(id, status, user = null) {
    const po = await purchaseOrderRepository.findPOById(id);
    if (!po) {
      throw new Error(`Purchase order '${id}' not found.`);
    }

    const prevStatus = po.status;

    return await withTransaction(async (conn) => {
      await purchaseOrderRepository.updateStatus(po.id, status, user?.name || 'system', conn);

      // If marked Delivered and was not previously delivered, automatically replenish stock!
      if (status === 'Delivered' && prevStatus !== 'Delivered') {
        // Record Goods Receipt
        await goodsReceiptRepository.createReceipt(
          {
            purchaseOrderId: po.id,
            warehouseId: 1,
            storeId: 1,
            receivedByUserId: user?.userId || 1,
            status: 'Delivered',
            user: user?.name || 'Procurement System',
          },
          conn
        );

        // Replenish each item in inventory
        for (const item of po.items) {
          const product = await productRepository.findProductById(item.internalProductId || item.productId, conn);
          if (product) {
            const previousStock = product.stock;
            const newStock = previousStock + item.quantity;

            await inventoryRepository.upsertStock(product.id, 1, newStock, user?.name || 'Procurement System', conn);

            await stockTransactionRepository.createTransaction(
              {
                productId: product.id,
                storeId: 1,
                type: 'PURCHASE',
                quantity: item.quantity,
                referenceNumber: po.poNumber,
                referenceType: 'PO_RECEIPT',
                referenceId: po.id,
                unitCost: item.unitCost,
                performedByUserId: user?.userId || 1,
                remarks: `PO #${po.poNumber} Delivery Restock`,
                user: user?.name || 'Procurement System',
              },
              conn
            );
          }
        }
      }

      return await purchaseOrderRepository.findPOById(po.id, conn);
    });
  }
}

module.exports = new PurchaseOrderService();
