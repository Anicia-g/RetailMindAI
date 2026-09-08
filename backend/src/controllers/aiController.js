const aiAssistantService = require('../services/aiAssistantService');
const intelligenceService = require('../services/ai/intelligenceService');
const reorderIntelligenceService = require('../services/ai/reorderIntelligenceService');
const discountIntelligenceService = require('../services/ai/discountIntelligenceService');
const customerInsightService = require('../services/ai/customerInsightService');
const demandForecastInsightService = require('../services/ai/demandForecastInsightService');
const anomalyInsightService = require('../services/ai/anomalyInsightService');
const { successResponse } = require('../utils/apiResponse');

class AIController {
  /**
   * POST /api/ai/chat
   * Role-aware conversational AI assistant query
   */
  async chat(req, res, next) {
    try {
      const { query, role, store } = req.body;
      const userRole = role || req.user?.role || 'ADMIN';
      const userStore = store || req.user?.storeId || req.user?.store || 'Indiranagar Flagship (Store 01)';

      const result = await aiAssistantService.processQuery({
        query,
        role: userRole,
        store: userStore,
        user: req.user,
      });

      return successResponse(res, result, 'AI assistant response generated');
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/ai/insights
   * Unified dashboard intelligence summary
   */
  async getInsights(req, res, next) {
    try {
      const role = req.user?.role || req.query.role || 'ADMIN';
      const storeId = req.query.storeId || req.user?.storeId || null;

      const data = await intelligenceService.getDashboardInsights({
        role,
        storeId,
        user: req.user,
      });

      return successResponse(res, data, 'AI dashboard intelligence insights fetched');
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/ai/recommendations
   * Retrieves active persistent AI recommendations
   */
  async getRecommendations(req, res, next) {
    try {
      const { type, priority, storeId, limit } = req.query;
      const data = await intelligenceService.getActiveRecommendations({
        type,
        priority,
        storeId: storeId || req.user?.storeId,
        limit: parseInt(limit || '20', 10),
      });

      return successResponse(res, data, 'Active AI recommendations retrieved');
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/ai/reorder
   * Prioritized smart reorder recommendations
   */
  async getReorder(req, res, next) {
    try {
      const storeId = req.query.storeId || (req.user?.role === 'SELLER' ? req.user.storeId : null);
      const data = await reorderIntelligenceService.generateReorderRecommendations(storeId);

      return successResponse(res, data, 'Smart reorder recommendations generated');
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/ai/discount-candidates
   * Intelligent markdown candidates
   */
  async getDiscountCandidates(req, res, next) {
    try {
      const storeId = req.query.storeId || (req.user?.role === 'SELLER' ? req.user.storeId : null);
      const limit = parseInt(req.query.limit || '10', 10);
      const data = await discountIntelligenceService.getDiscountCandidates(storeId, limit);

      return successResponse(res, data, 'Smart discount candidates fetched');
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/ai/customer-insights
   * RFM segmentation strategy & retention campaigns
   */
  async getCustomerInsights(req, res, next) {
    try {
      if (req.query.customerId) {
        const data = await customerInsightService.getIndividualCustomerInsight(req.query.customerId);
        return successResponse(res, data, 'Individual customer AI insight generated');
      }

      const data = await customerInsightService.getSegmentInsights();
      return successResponse(res, data, 'Customer segment intelligence fetched');
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/ai/forecast-insights
   * Demand forecast business intelligence & stock pressure
   */
  async getForecastInsights(req, res, next) {
    try {
      const storeId = req.query.storeId || null;
      const data = await demandForecastInsightService.getForecastInsights(storeId);

      return successResponse(res, data, 'Demand forecast intelligence fetched');
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/ai/anomaly-insights
   * Anomaly detection audits
   */
  async getAnomalyInsights(req, res, next) {
    try {
      const limit = parseInt(req.query.limit || '20', 10);
      const data = await anomalyInsightService.getAnomalyInsights(limit);

      return successResponse(res, data, 'Anomaly detection audit insights fetched');
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/ai/history
   * Chat history for the authenticated user
   */
  async getChatHistory(req, res, next) {
    try {
      const userId = req.user?.id || req.user?._id;
      const role = req.user?.role;
      const limit = parseInt(req.query.limit || '30', 10);

      const history = await aiAssistantService.getChatHistory(userId, role, limit);
      return successResponse(res, history, 'Chat history retrieved');
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/ai/recommendations/:id/apply
   * Mark a recommendation as applied
   */
  async applyRecommendation(req, res, next) {
    try {
      const { id } = req.params;
      const updated = await intelligenceService.applyRecommendation(id, req.user?.email);

      return successResponse(res, updated, 'Recommendation status updated to APPLIED');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AIController();
