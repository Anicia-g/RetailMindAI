const Product = require('../models/Product');
const Inventory = require('../models/Inventory');

class InventoryRiskService {
  async evaluateInventoryRisk(storeId = null) {
    const query = { bit_IsActive: true };
    if (storeId && storeId !== 'All') {
      query.$or = [{ storeId }, { 'storeAssignments.storeId': storeId }];
    }

    const products = await Product.find(query);

    const riskAssessments = products.map((product) => {
      const stock = product.stock || 0;
      const reorderLevel = product.reorderLevel || 20;
      const velocity = product.dailyVelocity || 1;

      const expectedStockOutDays = velocity > 0 ? Number((stock / velocity).toFixed(1)) : 30;

      let riskLevel = 'LOW';
      let stockOutProbability = 15;

      if (stock <= 0 || expectedStockOutDays <= 2) {
        riskLevel = 'HIGH';
        stockOutProbability = 92;
      } else if (stock <= reorderLevel || expectedStockOutDays <= 5) {
        riskLevel = 'MEDIUM';
        stockOutProbability = 68;
      } else {
        riskLevel = 'LOW';
        stockOutProbability = 18;
      }

      const recommendedReorderQuantity = Math.max(
        0,
        Math.round(velocity * 14 + reorderLevel - stock)
      );

      return {
        productId: product.productId,
        productName: product.name,
        sku: product.sku,
        category: product.category,
        image: product.image,
        currentStock: stock,
        reorderLevel,
        dailyVelocity: velocity,
        predictedDemand14d: Math.round(velocity * 14),
        stockOutProbability,
        expectedStockOutDays,
        riskLevel,
        status: product.stockStatus,
        recommendedReorderQuantity,
        supplier: product.supplier,
        supplierId: product.supplierId,
        urgency:
          riskLevel === 'HIGH'
            ? 'Urgent morning restock required'
            : riskLevel === 'MEDIUM'
            ? 'Order batch ahead of weekend cycle'
            : 'Sufficient buffer inventory',
      };
    });

    // Sort by highest risk first
    const riskPriority = { HIGH: 3, MEDIUM: 2, LOW: 1 };
    riskAssessments.sort((a, b) => riskPriority[b.riskLevel] - riskPriority[a.riskLevel]);

    return {
      success: true,
      totalEvaluated: riskAssessments.length,
      highRiskCount: riskAssessments.filter((r) => r.riskLevel === 'HIGH').length,
      mediumRiskCount: riskAssessments.filter((r) => r.riskLevel === 'MEDIUM').length,
      lowRiskCount: riskAssessments.filter((r) => r.riskLevel === 'LOW').length,
      riskAssessments,
    };
  }
}

module.exports = new InventoryRiskService();
