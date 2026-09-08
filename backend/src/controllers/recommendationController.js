const mlClientService = require('../services/mlClientService');
const recommendationService = require('../services/recommendationService');
const AiRecommendation = require('../models/AiRecommendation');
const { successResponse } = require('../utils/apiResponse');

class RecommendationController {
  async getRecommendations(req, res, next) {
    try {
      const type = req.query.type || 'personalized';
      const customerId = req.user?.id || req.query.customerId || 'cust-001';

      if (type === 'frequently-bought-together' && req.query.productId) {
        const mlRecs = await mlClientService.getFrequentlyBoughtTogether(req.query.productId, req.query.limit || 4);
        return successResponse(res, mlRecs, 'Frequently bought together recommendations fetched');
      }

      if (type === 'personalized') {
        const mlRecs = await mlClientService.getPersonalizedRecommendations(
          customerId,
          ['Dairy & Eggs', 'Bakery & Snacks'],
          req.query.limit || 4
        );
        if (mlRecs && mlRecs.recommendations && mlRecs.recommendations.length > 0) {
          // Persist personalized recommendation log
          try {
            await AiRecommendation.create({
              recommendationType: 'PERSONALIZED',
              customerId: customerId,
              recommendedProducts: mlRecs.recommendations.map((r) => ({
                productId: r.productId,
                name: r.name,
                category: r.category,
                price: r.price,
                confidence: r.affinityScore || 0.85,
              })),
              modelVersion: 'recommendation_v1',
              generatedDate: new Date(),
              txt_Created_By: req.user?.email || 'system',
              dte_Created_Date: new Date(),
            });
          } catch (dbErr) {
            console.warn('[RecommendationController] Failed to persist AiRecommendation record:', dbErr.message);
          }

          return successResponse(res, mlRecs.recommendations, 'Personalized recommendations fetched via Python ML');
        }
      }

      const fallbackRecs = await recommendationService.getRecommendations(type, customerId);
      return successResponse(res, fallbackRecs, 'Product recommendations fetched (fallback)');
    } catch (err) {
      next(err);
    }
  }

  async getFrequentlyBoughtTogether(req, res, next) {
    try {
      const { productId } = req.params;
      const limit = parseInt(req.query.limit || '4', 10);
      const data = await mlClientService.getFrequentlyBoughtTogether(productId, limit);

      if (data && data.recommendations) {
        // Persist bundle cross-sell recommendation
        try {
          await AiRecommendation.create({
            recommendationType: 'BUNDLE_CROSS_SELL',
            productId: productId,
            productName: data.productName || '',
            recommendedProducts: data.recommendations.map((r) => ({
              productId: r.productId,
              name: r.name,
              category: r.category,
              price: r.price,
              confidence: r.confidence,
              lift: r.lift,
            })),
            modelVersion: 'recommendation_v1',
            generatedDate: new Date(),
            txt_Created_By: req.user?.email || 'system',
            dte_Created_Date: new Date(),
          });
        } catch (dbErr) {
          console.warn('[RecommendationController] Failed to persist AiRecommendation record:', dbErr.message);
        }
      }

      return successResponse(res, data, 'Frequently bought together recommendations fetched');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new RecommendationController();
