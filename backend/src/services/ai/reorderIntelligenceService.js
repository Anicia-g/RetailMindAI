const productRepository = require('../../repositories/productRepository');
const supplierRepository = require('../../repositories/supplierRepository');
const stockRiskRepository = require('../../repositories/stockRiskRepository');
const demandForecastRepository = require('../../repositories/demandForecastRepository');
const aiRecommendationRepository = require('../../repositories/aiRecommendationRepository');

class ReorderIntelligenceService {
  /**
   * Generates intelligent, prioritized reorder recommendations using:
   * Current Stock + Daily Sales Velocity + ML Forecast + Supplier Lead Times + Stock Risk
   */
  async generateReorderRecommendations(storeId = null) {
    const productFilter = { bit_IsActive: true };
    if (storeId && storeId !== 'All' && storeId !== 'all') {
      productFilter.int_Store_Id = storeId;
    }

    const [products, suppliers, stockRisks, forecasts] = await Promise.all([
      productRepository.getAll(productFilter),
      supplierRepository.getAll({ bit_IsActive: true }),
      stockRiskRepository.getAll({ bit_IsActive: true }),
      demandForecastRepository.getAll({ bit_IsActive: true }),
    ]);

    // Lookup maps
    const supplierMap = new Map();
    suppliers.forEach((s) => {
      supplierMap.set(String(s.supplierId), s);
      supplierMap.set(s.name, s);
    });

    const riskMap = new Map();
    stockRisks.forEach((r) => {
      riskMap.set(String(r.productId), r);
    });

    const forecastMap = new Map();
    forecasts.forEach((f) => {
      forecastMap.set(String(f.productId), f);
    });

    const recommendations = [];

    for (const p of products) {
      const pIdStr = String(p.productId);
      const stock = Number(p.stock) || 0;
      const reorderLevel = Number(p.reorderLevel) || 15;
      const supplier = supplierMap.get(String(p.supplierId)) || supplierMap.get(p.supplier) || null;
      const leadTimeDays = supplier?.leadTimeDays || 3;
      const supplierName = supplier?.name || p.supplier || 'Primary Distributor';

      const riskDoc = riskMap.get(pIdStr);
      const forecastDoc = forecastMap.get(pIdStr);

      // Determine robust daily velocity
      let dailyVelocity = Number(p.dailyVelocity) || 0;
      if (forecastDoc && (forecastDoc.forecastedQuantity || forecastDoc.predictedDemand) > 0) {
        dailyVelocity = (Number(forecastDoc.forecastedQuantity || forecastDoc.predictedDemand) || 28) / 14;
      } else if (dailyVelocity <= 0) {
        dailyVelocity = 1.2; // Baseline minimum turnover
      }

      // Calculate runway in days
      const daysRemaining = Math.round((stock / Math.max(0.1, dailyVelocity)) * 10) / 10;

      // Determine risk score & probability
      const riskLevel = riskDoc?.riskLevel || (daysRemaining <= 3 ? 'HIGH' : daysRemaining <= 7 ? 'MEDIUM' : 'LOW');
      const stockOutProbability = riskDoc ? (riskDoc.riskScore ? riskDoc.riskScore / 100 : 0.65) : (daysRemaining <= 2 ? 0.92 : daysRemaining <= 5 ? 0.65 : 0.15);

      // Replenishment buffer calculation: Lead Time Demand + Safety Stock (3 days buffer)
      const leadTimeDemand = dailyVelocity * leadTimeDays;
      const safetyStock = Math.ceil(dailyVelocity * 3);
      const targetBuffer = Math.ceil(leadTimeDemand + safetyStock + (reorderLevel * 1.5));
      const deficit = targetBuffer - stock;
      const suggestedReorderQuantity = Math.max(reorderLevel * 2, Math.ceil(deficit > 0 ? deficit : reorderLevel * 2));

      // Classify priority
      let priority = 'LOW';
      if (stock === 0 || daysRemaining <= 2.0 || riskLevel === 'HIGH' || riskLevel === 'CRITICAL') {
        priority = 'CRITICAL';
      } else if (daysRemaining <= 5.0 || stock <= reorderLevel) {
        priority = 'HIGH';
      } else if (daysRemaining <= 10.0 || riskLevel === 'MEDIUM') {
        priority = 'MEDIUM';
      }

      // Filter: only generate reorder recommendations for items with stock pressure
      const needsReorder = stock <= reorderLevel || daysRemaining <= 14 || priority === 'CRITICAL' || priority === 'HIGH';

      if (needsReorder) {
        let reason = '';
        if (stock === 0) {
          reason = `SKU is currently completely out of stock with active customer demand. Immediate PO of ${suggestedReorderQuantity} units required from ${supplierName}.`;
        } else if (daysRemaining <= 2.5) {
          reason = `Velocity of ${dailyVelocity.toFixed(1)} units/day leaves only ${daysRemaining} days runway (${stock} units left). Supplier lead time is ${leadTimeDays} days.`;
        } else if (forecastDoc && (Number(forecastDoc.forecastedQuantity) || 0) > stock) {
          reason = `ML demand forecast projects ${forecastDoc.forecastedQuantity} units needed. Current stock (${stock}) is insufficient.`;
        } else {
          reason = `Current stock (${stock} units) is below reorder threshold (${reorderLevel} units). Buffer replenishment recommended.`;
        }

        const recItem = {
          productId: pIdStr,
          productName: p.name,
          category: p.category,
          storeId: String(p.storeId || '1'),
          storeName: p.store || 'Indiranagar Flagship',
          currentStock: stock,
          reorderLevel,
          dailyVelocity: Math.round(dailyVelocity * 10) / 10,
          daysRemaining,
          stockOutProbability: Math.round(stockOutProbability * 100) / 100,
          riskLevel,
          priority,
          supplierId: String(p.supplierId || '1'),
          supplierName,
          leadTimeDays,
          suggestedReorderQuantity,
          estimatedCost: Math.round(suggestedReorderQuantity * (Number(p.costPrice) || (p.price || 100) * 0.7)),
          recommendation: `Issue Purchase Order for ${suggestedReorderQuantity} units of ${p.name} from ${supplierName}.`,
          reason,
          explanation: `Calculated from ${dailyVelocity.toFixed(1)} units/day turnover, ${leadTimeDays}-day supplier lead time, and safety buffer.`,
        };

        recommendations.push(recItem);
      }
    }

    // Sort by priority order: CRITICAL -> HIGH -> MEDIUM -> LOW, then by daysRemaining ascending
    const priorityWeight = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
    recommendations.sort((a, b) => {
      const diff = (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
      if (diff !== 0) return diff;
      return a.daysRemaining - b.daysRemaining;
    });

    // Asynchronously synchronize top critical/high recommendations to tbl_AI_Recommendation
    this.syncPersistentRecommendations(recommendations.slice(0, 10)).catch((err) => {
      console.warn('[ReorderIntelligenceService] Background sync warning:', err.message);
    });

    return recommendations;
  }

  /**
   * Persists / updates top recommendations in tbl_AI_Recommendation
   */
  async syncPersistentRecommendations(topRecs) {
    for (const rec of topRecs) {
      try {
        await aiRecommendationRepository.create({
          type: 'REORDER',
          productId: rec.productId,
          storeId: rec.storeId || 1,
          title: rec.recommendation,
          description: rec.reason,
          confidenceScore: 0.95,
          status: 'Active',
          modelName: 'REORDER_OPTIMIZER_ENGINE',
          expectedImpact: rec.estimatedCost,
          isActive: true,
        });
      } catch (err) {
        // Continue silently
      }
    }
  }
}

module.exports = new ReorderIntelligenceService();

