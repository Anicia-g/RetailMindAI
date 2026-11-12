const mlClientService = require('../services/mlClientService');
const recommendationService = require('../services/recommendationService');
const aiRecommendationRepository = require('../repositories/aiRecommendationRepository');
const { successResponse } = require('../utils/apiResponse');

class RecommendationController {
  async getRecommendations(req, res, next) {
    try {
      const type = req.query.type || 'personalized';
      const customerId = req.user?.id || req.query.customerId || 1;

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
            await aiRecommendationRepository.create({
              type: 'PERSONALIZED',
              customerId: Number(customerId) || 1,
              title: `Personalized recommendation for customer #${customerId}`,
              description: `Personalized recommendations generated via ML Engine`,
              confidenceScore: 0.85,
              status: 'Active',
              modelName: 'recommendation_v1',
              isActive: true,
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
          await aiRecommendationRepository.create({
            type: 'BUNDLE_CROSS_SELL',
            productId: Number(productId) || 1,
            title: `Frequently bought together with product #${productId}`,
            description: data.productName || 'Bundle cross sell recommendations',
            confidenceScore: 0.9,
            status: 'Active',
            modelName: 'recommendation_v1',
            isActive: true,
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

