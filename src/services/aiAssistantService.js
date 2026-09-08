import { apiClient } from '@/lib/apiClient';
import { getAIResponse } from '@/data/aiResponses';

class AIAssistantService {
  /**
   * Universal query dispatcher supporting both:
   * 1. sendQuery(text, { role, storeId })
   * 2. sendQuery({ query: text, role, store })
   */
  async sendQuery(queryOrPayload, options = {}) {
    let query = '';
    let role = 'ADMIN';
    let store = 'Indiranagar Flagship (Store 01)';

    if (typeof queryOrPayload === 'string') {
      query = queryOrPayload;
      role = options.role || 'ADMIN';
      store = options.storeId || options.store || store;
    } else if (typeof queryOrPayload === 'object' && queryOrPayload !== null) {
      query = queryOrPayload.query || '';
      role = queryOrPayload.role || options.role || 'ADMIN';
      store = queryOrPayload.store || queryOrPayload.storeId || options.store || store;
    }

    try {
      const response = await apiClient.post('/ai/chat', { query, role, store });
      if (response && response.data) {
        return response.data;
      }
    } catch (err) {
      console.warn('[AIAssistantService] API unavailable, using local intelligence engine:', err.message);
    }

    return getAIResponse(query, role);
  }

  /**
   * Retrieves unified AI dashboard intelligence insights
   */
  async getInsights(params = {}) {
    try {
      const res = await apiClient.get('/ai/insights', { params });
      return res?.data || null;
    } catch (err) {
      console.warn('[AIAssistantService] getInsights fallback notice:', err.message);
      return null;
    }
  }

  /**
   * Retrieves active persistent AI recommendations
   */
  async getRecommendations(params = {}) {
    try {
      const res = await apiClient.get('/ai/recommendations', { params });
      return res?.data || [];
    } catch (err) {
      console.warn('[AIAssistantService] getRecommendations fallback notice:', err.message);
      return [];
    }
  }

  /**
   * Retrieves prioritized smart reorder recommendations
   */
  async getReorderRecommendations(storeId = null) {
    try {
      const res = await apiClient.get('/ai/reorder', { params: { storeId } });
      return res?.data || [];
    } catch (err) {
      console.warn('[AIAssistantService] getReorderRecommendations fallback notice:', err.message);
      return [];
    }
  }

  /**
   * Retrieves smart discount candidate evaluations
   */
  async getDiscountCandidates(storeId = null, limit = 10) {
    try {
      const res = await apiClient.get('/ai/discount-candidates', { params: { storeId, limit } });
      return res?.data || [];
    } catch (err) {
      console.warn('[AIAssistantService] getDiscountCandidates fallback notice:', err.message);
      return [];
    }
  }

  /**
   * Retrieves customer RFM segment intelligence
   */
  async getCustomerInsights(customerId = null) {
    try {
      const res = await apiClient.get('/ai/customer-insights', { params: { customerId } });
      return res?.data || null;
    } catch (err) {
      console.warn('[AIAssistantService] getCustomerInsights fallback notice:', err.message);
      return null;
    }
  }

  /**
   * Retrieves demand forecasting business intelligence
   */
  async getForecastInsights(storeId = null) {
    try {
      const res = await apiClient.get('/ai/forecast-insights', { params: { storeId } });
      return res?.data || null;
    } catch (err) {
      console.warn('[AIAssistantService] getForecastInsights fallback notice:', err.message);
      return null;
    }
  }

  /**
   * Retrieves transaction anomaly audit logs
   */
  async getAnomalyInsights(limit = 20) {
    try {
      const res = await apiClient.get('/ai/anomaly-insights', { params: { limit } });
      return res?.data || null;
    } catch (err) {
      console.warn('[AIAssistantService] getAnomalyInsights fallback notice:', err.message);
      return null;
    }
  }

  /**
   * Retrieves conversational chat history
   */
  async getChatHistory(limit = 30) {
    try {
      const res = await apiClient.get('/ai/history', { params: { limit } });
      return res?.data || [];
    } catch (err) {
      console.warn('[AIAssistantService] getChatHistory fallback notice:', err.message);
      return [];
    }
  }

  /**
   * Mark an AI recommendation as applied
   */
  async applyRecommendation(id) {
    try {
      const res = await apiClient.post(`/ai/recommendations/${id}/apply`);
      return res?.data || null;
    } catch (err) {
      console.warn('[AIAssistantService] applyRecommendation fallback notice:', err.message);
      return null;
    }
  }
}

export const aiAssistantService = new AIAssistantService();
