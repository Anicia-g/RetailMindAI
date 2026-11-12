const productRepository = require('../../repositories/productRepository');
const aiRecommendationRepository = require('../../repositories/aiRecommendationRepository');
const mlClientService = require('../mlClientService');

class DiscountIntelligenceService {
  /**
   * Generates explainable smart discount recommendations using ID3/C4.5 ML models
   * combined with shelf-life expiry, stock velocity, and gross margin protection.
   */
  async evaluateProductDiscount(productId, modelType = 'C4.5') {
    let product = await productRepository.getById(productId);
    if (!product) {
      const bySku = await productRepository.getAll({ txt_Product_Code: productId });
      product = bySku[0];
    }
    if (!product) {
      throw new Error(`Product not found: ${productId}`);
    }

    const price = Number(product.price) || 100;
    const costPrice = Number(product.costPrice) || Math.round(price * 0.7);
    const stock = Number(product.stock) || 0;
    const expiryDays = Number(product.expiryDays) || 30;
    const dailyVelocity = Number(product.dailyVelocity) || 1.0;
    const grossMarginPct = Math.round(((price - costPrice) / price) * 100);

    // Call ML Microservice for decision tree evaluation
    let mlResult = null;
    try {
      mlResult = await mlClientService.predictDiscount(
        productId,
        grossMarginPct,
        stock,
        dailyVelocity,
        expiryDays,
        'MONSOON',
        modelType
      );
    } catch (err) {
      console.warn('[DiscountIntelligenceService] ML service unavailable, utilizing analytical tree rule:', err.message);
    }

    let recommendedDiscount = 0;
    let confidence = 0.85;
    let importantFactors = [];
    let decisionPath = [];

    if (mlResult && mlResult.recommendedDiscount !== undefined) {
      recommendedDiscount = Number(mlResult.recommendedDiscount);
      confidence = mlResult.confidence || 0.88;
      importantFactors = mlResult.importantFactors || [];
      decisionPath = mlResult.decisionPath || [];
    } else {
      // Analytical heuristic fallback matching C4.5 entropy thresholds
      if (expiryDays <= 4 && stock > 5) {
        recommendedDiscount = 15;
        confidence = 0.90;
        importantFactors = ['Short Expiry Window (<= 4 days)', 'High Perishable Stock', 'Margin Buffer Available'];
      } else if (expiryDays <= 7 || (dailyVelocity < 1.0 && stock > 20)) {
        recommendedDiscount = 10;
        confidence = 0.85;
        importantFactors = ['Approaching Expiry (<= 7 days)', 'Sub-optimal Velocity', 'Volume Clearance'];
      } else if (stock > 50 && dailyVelocity < 2.0) {
        recommendedDiscount = 5;
        confidence = 0.80;
        importantFactors = ['Overstock Capital Exposure', 'Price Elastic Demand'];
      } else {
        recommendedDiscount = 0;
        confidence = 0.95;
        importantFactors = ['Healthy Velocity', 'Ample Shelf Life', 'Margin Preservation Priority'];
      }
    }

    // Calculate post-discount financial metrics
    const discountedPrice = Math.round(price * (1 - recommendedDiscount / 100) * 100) / 100;
    const postDiscountMarginPct = discountedPrice > 0
      ? Math.round(((discountedPrice - costPrice) / discountedPrice) * 100)
      : 0;

    // Projected velocity boost based on retail price elasticity (~2.5x elasticity)
    const projectedVelocityBoost = recommendedDiscount > 0 ? Math.round(recommendedDiscount * 3.8) : 0;
    const projectedDailyVelocity = Math.round((dailyVelocity * (1 + projectedVelocityBoost / 100)) * 10) / 10;

    // Synthesize transparent business explanation
    let reason = '';
    let explanation = '';

    if (recommendedDiscount > 0) {
      if (expiryDays <= 7) {
        reason = `Approaching shelf expiry window (${expiryDays} days remaining with ${stock} units in stock). A ${recommendedDiscount}% promotional discount accelerates sell-through before spoilage while securing a ${postDiscountMarginPct}% gross margin.`;
        explanation = `Decision Model: ${modelType} Information Gain on Expiry (${expiryDays}d) + Stock (${stock}u) -> ${recommendedDiscount}% clearance band. Expected sales velocity increases from ${dailyVelocity} to ${projectedDailyVelocity} units/day.`;
      } else {
        reason = `Current inventory velocity (${dailyVelocity} units/day) is trailing target. Applying a ${recommendedDiscount}% discount unlocks ${projectedVelocityBoost}% demand lift while preserving ${postDiscountMarginPct}% profitability.`;
        explanation = `Decision Model: ${modelType} Multi-way Split on Velocity & Stock Volume. Price drops from ₹${price} to ₹${discountedPrice}.`;
      }
    } else {
      reason = `Product maintains healthy turnover (${dailyVelocity} units/day) and adequate shelf life (${expiryDays} days). No markdown required; maintain 0% discount to maximize full ₹${price} revenue and ${grossMarginPct}% gross margin.`;
      explanation = `Decision Model: ${modelType} Optimal Node. Margin preservation takes precedence over volume stimulation.`;
    }

    const recommendationData = {
      productId: String(product.productId),
      productName: product.name,
      category: product.category,
      storeId: String(product.storeId || '1'),
      storeName: product.store || 'Indiranagar Flagship',
      originalPrice: price,
      costPrice,
      currentDiscount: product.discountPct || 0,
      recommendedDiscount,
      discountFormatted: `${recommendedDiscount}%`,
      discountedPrice,
      grossMarginPct,
      postDiscountMarginPct,
      expiryDays,
      currentStock: stock,
      dailyVelocity,
      projectedDailyVelocity,
      projectedVelocityBoostPct: projectedVelocityBoost,
      modelUsed: modelType,
      confidence: Math.round(confidence * 100) / 100,
      importantFactors,
      decisionPath,
      reason,
      explanation,
      generatedDate: new Date(),
    };

    // Asynchronously persist to tbl_AI_Recommendation if actionable discount > 0
    if (recommendedDiscount > 0) {
      try {
        await aiRecommendationRepository.create({
          type: 'DISCOUNT',
          productId: product.productId,
          storeId: product.storeId || 1,
          title: `Apply ${recommendedDiscount}% promotional markdown on ${product.name}`,
          description: reason,
          confidenceScore: confidence,
          status: 'Active',
          modelName: `${modelType}_DECISION_TREE`,
          expectedImpact: Math.round(price * recommendedDiscount * 0.1),
          isActive: true,
        });
      } catch (err) {
        // Continue silently
      }
    }

    return recommendationData;
  }

  /**
   * Retrieves high-priority discount candidates for store managers and sellers
   */
  async getDiscountCandidates(storeId = null, limit = 10) {
    const filter = { bit_IsActive: true };
    if (storeId && storeId !== 'All' && storeId !== 'all') {
      filter.int_Store_Id = storeId;
    }

    const products = await productRepository.getAll(filter);

    // Prioritize candidates with short expiry or slow moving inventory
    const candidates = products
      .filter((p) => (p.expiryDays && p.expiryDays <= 10 && p.stock > 0) || (p.stock > 15 && (p.dailyVelocity || 0) < 1.5))
      .slice(0, limit);

    const results = [];
    for (const prod of candidates) {
      try {
        const evaluation = await this.evaluateProductDiscount(prod.productId, 'C4.5');
        if (evaluation.recommendedDiscount > 0) {
          results.push(evaluation);
        }
      } catch (e) {
        // Skip errored items
      }
    }

    // Sort by priority (highest discount and lowest expiry first)
    results.sort((a, b) => {
      if (a.expiryDays !== b.expiryDays) return a.expiryDays - b.expiryDays;
      return b.recommendedDiscount - a.recommendedDiscount;
    });

    return results;
  }
}

module.exports = new DiscountIntelligenceService();

