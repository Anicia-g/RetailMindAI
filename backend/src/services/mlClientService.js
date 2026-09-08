const http = require('http');
const config = require('../config/env');

class MLClientService {
  constructor() {
    this.baseUrl = config.mlServiceUrl || 'http://127.0.0.1:8000';
    this.timeoutMs = 4000;
  }

  /**
   * Internal helper to make JSON HTTP requests to the Python FastAPI ML Service
   */
  async request(method, path, body = null) {
    return new Promise((resolve, reject) => {
      try {
        const url = new URL(path, this.baseUrl);
        const postData = body ? JSON.stringify(body) : null;

        const options = {
          hostname: url.hostname,
          port: url.port,
          path: url.pathname + url.search,
          method: method.toUpperCase(),
          headers: {
            'Content-Type': 'application/json',
            ...(postData ? { 'Content-Length': Buffer.byteLength(postData) } : {}),
          },
          timeout: this.timeoutMs,
        };

        const req = http.request(options, (res) => {
          let rawData = '';
          res.on('data', (chunk) => {
            rawData += chunk;
          });
          res.on('end', () => {
            try {
              const parsed = JSON.parse(rawData);
              if (res.statusCode >= 200 && res.statusCode < 300) {
                resolve(parsed.data !== undefined ? parsed.data : parsed);
              } else {
                reject(new Error(parsed.detail || `ML Service HTTP ${res.statusCode}: ${rawData}`));
              }
            } catch (err) {
              if (res.statusCode >= 200 && res.statusCode < 300) {
                resolve(rawData);
              } else {
                reject(new Error(`Failed to parse ML response: ${rawData}`));
              }
            }
          });
        });

        req.on('timeout', () => {
          req.destroy();
          reject(new Error(`ML Service request to ${path} timed out after ${this.timeoutMs}ms`));
        });

        req.on('error', (err) => {
          reject(new Error(`ML Service connection failed (${this.baseUrl}): ${err.message}`));
        });

        if (postData) {
          req.write(postData);
        }
        req.end();
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * 1. Health Probe
   */
  async checkHealth() {
    try {
      return await this.request('GET', '/health');
    } catch (err) {
      return { status: 'offline', error: err.message, service: 'retailmind-ml' };
    }
  }

  /**
   * 2. Customer Segmentation (RFM + K-Means)
   */
  async predictCustomerSegment(customerId, recency, frequency, monetary) {
    try {
      return await this.request('POST', '/customer-segmentation/predict', {
        customerId,
        recency: Number(recency),
        frequency: Number(frequency),
        monetary: Number(monetary),
      });
    } catch (err) {
      console.warn(`[MLClient] predictCustomerSegment failed for ${customerId}:`, err.message);
      // Heuristic fallback
      return {
        customerId,
        cluster: 2,
        segment: monetary > 30000 ? 'VIP' : 'Growing',
        recency,
        frequency,
        monetary,
        confidenceScore: 0.85,
        recommendation: 'Maintain standard customer engagement.',
        fallback: true,
      };
    }
  }

  async predictBatchCustomerSegments(customers) {
    try {
      return await this.request('POST', '/customer-segmentation/batch-predict', {
        customers,
      });
    } catch (err) {
      console.warn('[MLClient] predictBatchCustomerSegments failed, falling back:', err.message);
      return customers.map((c) => ({
        customerId: c.customerId,
        cluster: 1,
        segment: c.monetary > 25000 ? 'VIP' : 'Growing',
        confidenceScore: 0.8,
        fallback: true,
      }));
    }
  }

  /**
   * 3. Demand Forecasting (ARIMA & Holt-Winters)
   */
  async predictDemandForecast(productId, storeId = 'store-01', horizon = 14) {
    try {
      return await this.request('POST', '/forecast/predict', {
        productId,
        storeId,
        horizon: Number(horizon),
      });
    } catch (err) {
      console.warn(`[MLClient] predictDemandForecast failed for ${productId}:`, err.message);
      return null;
    }
  }

  /**
   * 4. Inventory Risk Prediction
   */
  async predictInventoryRisk(item) {
    try {
      return await this.request('POST', '/inventory-risk/predict', item);
    } catch (err) {
      console.warn(`[MLClient] predictInventoryRisk failed for ${item.productId}:`, err.message);
      return null;
    }
  }

  async predictBatchInventoryRisk(items) {
    try {
      return await this.request('POST', '/inventory-risk/batch-predict', { items });
    } catch (err) {
      console.warn('[MLClient] predictBatchInventoryRisk failed, returning fallback:', err.message);
      return items.map((it) => ({
        productId: it.productId,
        riskLevel: it.currentStock <= (it.reorderLevel || 10) ? 'HIGH' : 'LOW',
        stockOutProbability: it.currentStock <= (it.reorderLevel || 10) ? 0.85 : 0.15,
        importantFactors: ['Fallback heuristic risk assessment'],
        fallback: true,
      }));
    }
  }

  /**
   * 5. Smart Discount Recommendation (ID3 / C4.5)
   */
  async predictDiscount(productId, margin, stock, velocity, expiryDays, season = 'MONSOON', model = 'C4.5') {
    try {
      return await this.request('POST', '/discount/predict', {
        productId,
        margin: Number(margin),
        stock: Number(stock),
        velocity: Number(velocity),
        expiryDays: Number(expiryDays),
        season,
        model,
      });
    } catch (err) {
      console.warn(`[MLClient] predictDiscount failed for ${productId}:`, err.message);
      return {
        productId,
        recommendedDiscount: expiryDays <= 3 ? 20 : 0,
        discountFormatted: expiryDays <= 3 ? '20%' : '0%',
        modelUsed: model,
        importantFactors: ['Rule-based markdown fallback'],
        confidence: 0.8,
        fallback: true,
      };
    }
  }

  async getDiscountRecommendation(productId, model = 'C4.5') {
    return await this.predictDiscount(productId, 30, 20, 1.5, 5, 'MONSOON', model);
  }

  /**
   * 6. Product Recommendations
   */
  async getFrequentlyBoughtTogether(productId, limit = 4) {
    try {
      return await this.request('POST', '/recommendations/frequently-bought-together', {
        productId,
        limit: Number(limit),
      });
    } catch (err) {
      console.warn(`[MLClient] getFrequentlyBoughtTogether failed for ${productId}:`, err.message);
      return {
        productId,
        recommendations: [],
        fallback: true,
      };
    }
  }

  async getPersonalizedRecommendations(customerId, recentCategories = [], limit = 4) {
    try {
      return await this.request('POST', '/recommendations/personalized', {
        customerId,
        recentCategories,
        limit: Number(limit),
      });
    } catch (err) {
      console.warn(`[MLClient] getPersonalizedRecommendations failed for ${customerId}:`, err.message);
      return {
        customerId,
        recommendations: [],
        fallback: true,
      };
    }
  }

  /**
   * 7. Anomaly Detection
   */
  async detectAnomaly(transactionId, totalAmount, itemCount, hourOfDay = 14, discountPct = 0) {
    try {
      return await this.request('POST', '/anomaly-detection/predict', {
        transactionId,
        totalAmount: Number(totalAmount),
        itemCount: Number(itemCount),
        hourOfDay: Number(hourOfDay),
        discountPct: Number(discountPct),
      });
    } catch (err) {
      console.warn(`[MLClient] detectAnomaly failed for ${transactionId}:`, err.message);
      return {
        transactionId,
        isAnomaly: totalAmount > 30000 || itemCount > 40,
        anomalyScore: totalAmount > 30000 ? 0.85 : 0.1,
        importantFeatures: ['Heuristic fallback threshold inspection'],
        fallback: true,
      };
    }
  }

  /**
   * 8. Model Evaluation & Performance Metrics
   */
  async getModelPerformance() {
    try {
      return await this.request('GET', '/models/performance');
    } catch (err) {
      console.warn('[MLClient] getModelPerformance failed:', err.message);
      return null;
    }
  }
}

module.exports = new MLClientService();
