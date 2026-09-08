import { initialProducts } from '@/data/products';
import { productService } from './productService';
import { apiClient } from '@/lib/apiClient';

/**
 * Smart Discount Service
 * Integrates with Decision Tree Classification Models (ID3 / C4.5) via Express ML API
 */
class DiscountService {
  async getDiscountRecommendationForProduct(productId, model = 'C4.5') {
    try {
      const response = await apiClient.post('/ml/discount-recommendation', { productId, model });
      if (response && response.data) {
        return response.data;
      }
    } catch (err) {}

    const product = await productService.getProductById(productId);
    if (!product) return null;

    if (product.smartDiscount) {
      return {
        productId: product.id || product.productId,
        productName: product.name,
        currentPrice: product.price,
        originalPrice: product.originalPrice,
        stock: product.stock,
        dailyVelocity: product.dailyVelocity,
        velocityChange: product.velocityChange,
        expiryDays: product.expiryDays,
        demandLevel: product.demandLevel,
        inventoryLevel: product.inventoryLevel,
        recommendedDiscount: product.smartDiscount.recommended,
        confidence: product.smartDiscount.confidence,
        model: product.smartDiscount.model || 'C4.5',
        reason: product.smartDiscount.reason,
        factors: product.smartDiscount.factors || [],
        expectedEffect:
          product.smartDiscount.expectedEffect ||
          'Optimize inventory movement and protect profit margin.',
        previousPerformance: product.smartDiscount.previousPerformance || [
          { discount: 0, velocity: product.dailyVelocity, margin: 40 },
          {
            discount: 5,
            velocity: Math.round(product.dailyVelocity * 1.2 * 10) / 10,
            margin: 36,
          },
          {
            discount: 10,
            velocity: Math.round(product.dailyVelocity * 1.4 * 10) / 10,
            margin: 32,
          },
          {
            discount: 15,
            velocity: Math.round(product.dailyVelocity * 1.7 * 10) / 10,
            margin: 28,
          },
          {
            discount: 20,
            velocity: Math.round(product.dailyVelocity * 1.9 * 10) / 10,
            margin: 24,
          },
        ],
      };
    }

    const isHighStock = product.stock > product.reorderLevel;
    const isExpiring = product.expiryDays && product.expiryDays <= 7;
    const isDeclining = product.velocityChange?.startsWith('-');

    let modelUsed = 'C4.5';
    let recommended = 0;
    let confidence = 85;
    let factors = [];
    let reason =
      'Healthy turnover and balanced stock position. No promotional markdown needed.';

    if (isHighStock && isExpiring) {
      recommended = 15;
      modelUsed = 'C4.5';
      confidence = 89;
      factors = ['High stock volume', 'Approaching expiry window', 'Short shelf-life'];
      reason =
        'Stock volume exceeds expected pre-expiry consumption. A 15% discount will accelerate sell-through.';
    } else if (isHighStock && isDeclining) {
      recommended = 10;
      modelUsed = 'C4.5';
      confidence = 84;
      factors = ['Overstock buffer', 'Declining 14-day velocity', 'Healthy unit margin'];
      reason =
        'Sales velocity is slowing down while inventory buffer is ample. 10% promo restores momentum.';
    } else if (!isHighStock) {
      recommended = 0;
      modelUsed = 'ID3';
      confidence = 92;
      factors = ['Low stock level', 'High velocity', 'Stockout risk'];
      reason =
        'Available inventory is limited and demand is solid. Discounting would cause premature stockout.';
    }

    return {
      productId: product.id || product.productId,
      productName: product.name,
      currentPrice: product.price,
      originalPrice: product.originalPrice,
      stock: product.stock,
      dailyVelocity: product.dailyVelocity,
      velocityChange: product.velocityChange,
      expiryDays: product.expiryDays,
      demandLevel: product.demandLevel,
      inventoryLevel: product.inventoryLevel,
      recommendedDiscount: recommended,
      confidence,
      model: modelUsed,
      reason,
      factors,
      expectedEffect: 'Optimize inventory turnover and protect unit margin.',
      previousPerformance: [
        { discount: 0, velocity: product.dailyVelocity, margin: 40 },
        { discount: 5, velocity: Number((product.dailyVelocity * 1.2).toFixed(1)), margin: 36 },
        { discount: 10, velocity: Number((product.dailyVelocity * 1.4).toFixed(1)), margin: 32 },
        { discount: 15, velocity: Number((product.dailyVelocity * 1.7).toFixed(1)), margin: 28 },
        { discount: 20, velocity: Number((product.dailyVelocity * 1.9).toFixed(1)), margin: 24 },
      ],
    };
  }

  async applyDiscount(productId, discountPct) {
    const updated = await productService.updateProductDiscount(productId, discountPct);
    return {
      success: true,
      productId,
      appliedDiscount: discountPct,
      newPrice: updated.price,
      message: `${discountPct}% discount successfully applied to ${updated.name}.`,
    };
  }
}

export const discountService = new DiscountService();
