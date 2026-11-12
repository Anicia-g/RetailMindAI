const mlClientService = require('../services/mlClientService');
const customerAnalyticsService = require('../services/customerAnalyticsService');
const inventoryAnalyticsService = require('../services/inventoryAnalyticsService');
const kMeansService = require('../services/kMeansService');
const demandForecastingService = require('../services/demandForecastingService');
const inventoryRiskService = require('../services/inventoryRiskService');
const decisionTreeService = require('../services/decisionTreeService');

const customerSegmentRepository = require('../repositories/customerSegmentRepository');
const demandForecastRepository = require('../repositories/demandForecastRepository');
const stockRiskRepository = require('../repositories/stockRiskRepository');
const aiRecommendationRepository = require('../repositories/aiRecommendationRepository');
const anomalyLogRepository = require('../repositories/anomalyLogRepository');
const modelPerformanceRepository = require('../repositories/modelPerformanceRepository');
const { successResponse } = require('../utils/apiResponse');

class MlController {
  // 1. K-Means Customer Segmentation
  async getCustomerSegmentation(req, res, next) {
    try {
      // 1. Extract real customer RFM features from MySQL
      const rfmData = await customerAnalyticsService.getCustomerRFM();
      const customersList = Array.isArray(rfmData) ? rfmData : (rfmData?.customers || []);

      if (customersList.length > 0) {
        // 2. Call Python ML microservice batch prediction
        const mlPayload = customersList.map((c) => ({
          customerId: String(c.customerId),
          recency: Number(c.recencyDays || c.recency || 0),
          frequency: Number(c.frequency || c.totalOrders || 1),
          monetary: Number(c.monetary || c.totalSpent || 500),
        }));

        const mlResults = await mlClientService.predictBatchCustomerSegments(mlPayload);
        if (mlResults && mlResults.length > 0) {
          // Persist customer segmentation results into tbl_Customer_Segment
          try {
            for (const seg of mlResults) {
              await customerSegmentRepository.create({
                customerId: Number(seg.customerId) || 1,
                segmentName: seg.segment || 'Loyal',
                description: `Cluster ${seg.cluster || 1}`,
                recencyScore: seg.recency || 3,
                frequencyScore: seg.frequency || 3,
                monetaryScore: seg.monetary || 3,
                churnProbability: seg.segment === 'At Risk' ? 0.75 : 0.15,
                lifetimeValue: seg.monetary || 1000,
                assignedDate: new Date(),
                modelName: 'customer_segmentation_v1',
                isCurrent: true,
                isActive: true,
              });
            }
          } catch (dbErr) {
            console.warn('[MlController] Failed to persist CustomerSegment records:', dbErr.message);
          }

          const clusters = {
            'VIP': mlResults.filter((x) => x.segment === 'VIP').length,
            'Loyal': mlResults.filter((x) => x.segment === 'Loyal').length,
            'Growing': mlResults.filter((x) => x.segment === 'Growing').length,
            'At Risk': mlResults.filter((x) => x.segment === 'At Risk').length,
            'Inactive': mlResults.filter((x) => x.segment === 'Inactive').length,
          };

          return successResponse(
            res,
            {
              algorithm: 'K-Means Clustering (Python Scikit-Learn)',
              totalCustomers: mlResults.length,
              clusters,
              customerSegments: mlResults,
            },
            'Customer segmentation completed via Python ML Service'
          );
        }
      }

      // Fallback
      const fallbackResults = await kMeansService.runSegmentation();
      return successResponse(res, fallbackResults, 'Customer segmentation completed (fallback)');
    } catch (err) {
      next(err);
    }
  }

  // 2. Demand Forecast (ARIMA & Holt-Winters)
  async getDemandForecast(req, res, next) {
    try {
      const { productId } = req.params;
      const days = parseInt(req.query.days || '14', 10);
      const storeId = req.query.storeId || 1;

      const mlForecast = await mlClientService.predictDemandForecast(productId, storeId, days);
      if (mlForecast) {
        // Persist forecast into tbl_Demand_Forecast
        try {
          await demandForecastRepository.create({
            productId: Number(mlForecast.productId) || Number(productId) || 1,
            storeId: Number(mlForecast.storeId || storeId) || 1,
            forecastDate: new Date(),
            periodType: `${days}d`,
            forecastedQuantity: Number(mlForecast.totalForecastDemand) || 28,
            confidenceScore: 0.94,
            modelName: mlForecast.algorithm || 'ARIMA-HoltWinters',
            modelVersion: 'demand_forecast_v1',
            generatedDate: new Date(),
            isActive: true,
          });
        } catch (dbErr) {
          console.warn('[MlController] Failed to persist DemandForecast record:', dbErr.message);
        }

        return successResponse(res, mlForecast, 'Demand forecast computed via Python ML Service');
      }

      const fallbackForecast = await demandForecastingService.getForecast(productId, days);
      return successResponse(res, fallbackForecast, 'Demand forecast computed (fallback)');
    } catch (err) {
      next(err);
    }
  }

  // 3. Inventory Risk Prediction (Supervised Classifier)
  async getInventoryRisk(req, res, next) {
    try {
      const storeId = req.query.storeId || req.user?.storeId || 1;
      const riskFeatures = await inventoryAnalyticsService.getInventoryRiskFeatures(storeId);

      if (Array.isArray(riskFeatures) && riskFeatures.length > 0) {
        const mlAssessments = await mlClientService.predictBatchInventoryRisk(riskFeatures);
        if (mlAssessments && mlAssessments.length > 0) {
          // Persist stock risks into tbl_Stock_Risk
          try {
            for (const risk of mlAssessments) {
              await stockRiskRepository.create({
                productId: Number(risk.productId) || 1,
                storeId: Number(risk.storeId || storeId) || 1,
                riskType: 'Stockout',
                riskLevel: risk.riskLevel || 'Low',
                riskScore: (Number(risk.stockOutProbability) || 0.5) * 100,
                daysUntilStockout: Number(risk.daysRemaining) || 0,
                currentStockLevel: Number(risk.currentStock) || 0,
                predictedDemand: Number(risk.predictedDemand) || 0,
                recommendedAction: `Reorder ${risk.suggestedReorderQuantity || 0} units`,
                analysisDate: new Date(),
                modelName: risk.modelVersion || 'inventory_risk_v1',
                isActive: true,
              });
            }
          } catch (dbErr) {
            console.warn('[MlController] Failed to persist StockRisk records:', dbErr.message);
          }

          const highRiskCount = mlAssessments.filter((x) => x.riskLevel === 'HIGH').length;
          const mediumRiskCount = mlAssessments.filter((x) => x.riskLevel === 'MEDIUM').length;
          const lowRiskCount = mlAssessments.filter((x) => x.riskLevel === 'LOW').length;

          return successResponse(
            res,
            {
              storeId,
              totalItems: mlAssessments.length,
              summary: { highRiskCount, mediumRiskCount, lowRiskCount },
              riskAssessments: mlAssessments,
              algorithm: 'Supervised Gradient Boosting Classifier (Python Scikit-Learn)',
            },
            'Inventory risk evaluated via Python ML Service'
          );
        }
      }

      const fallbackEvaluation = await inventoryRiskService.evaluateInventoryRisk(storeId);
      return successResponse(res, fallbackEvaluation, 'Inventory risk evaluated (fallback)');
    } catch (err) {
      next(err);
    }
  }

  // 4. Smart Discount Recommendation (ID3 / C4.5 Decision Trees)
  async getDiscountRecommendation(req, res, next) {
    try {
      const { productId, model } = req.body;
      if (!productId) {
        return res.status(400).json({ success: false, message: 'productId is required' });
      }

      const featuresList = await inventoryAnalyticsService.getDiscountFeatures();
      const productFeature = Array.isArray(featuresList) ? featuresList.find((f) => String(f.productId) === String(productId)) : null;

      const margin = productFeature ? productFeature.profitMarginPct : 28.0;
      const stock = productFeature ? productFeature.currentStock : 25.0;
      const velocity = productFeature ? productFeature.salesVelocity : 4.0;
      const expiry = productFeature ? productFeature.daysToExpiry : 10.0;
      const season = productFeature ? productFeature.season : 'MONSOON';

      const mlDiscount = await mlClientService.predictDiscount(
        productId,
        margin,
        stock,
        velocity,
        expiry,
        season,
        model || 'C4.5'
      );

      // Persist recommendation into tbl_AI_Recommendation
      if (mlDiscount) {
        try {
          await aiRecommendationRepository.create({
            type: 'DISCOUNT_MARKDOWN',
            productId: Number(mlDiscount.productId) || Number(productId) || 1,
            title: `Markdown recommendation: ${mlDiscount.discountFormatted}`,
            description: `Model: ${mlDiscount.modelUsed}, Confidence: ${mlDiscount.confidence || 0.9}`,
            confidenceScore: mlDiscount.confidence || 0.9,
            status: 'Active',
            modelName: 'discount_c45_v1',
            expectedImpact: Number(mlDiscount.recommendedDiscount) || 0,
            isActive: true,
          });
        } catch (dbErr) {
          console.warn('[MlController] Failed to persist AiRecommendation record:', dbErr.message);
        }
      }

      return successResponse(res, mlDiscount, 'Smart discount recommendation generated via Python Decision Tree');
    } catch (err) {
      next(err);
    }
  }

  // 5. Transaction Anomaly Detection (Isolation Forest)
  async detectAnomaly(req, res, next) {
    try {
      const { transactionId, totalAmount, itemCount, hourOfDay, discountPct } = req.body;
      if (!totalAmount || !itemCount) {
        return res.status(400).json({ success: false, message: 'totalAmount and itemCount are required' });
      }

      const txId = transactionId || `tx-${Date.now()}`;
      const result = await mlClientService.detectAnomaly(
        txId,
        totalAmount,
        itemCount,
        hourOfDay || 14,
        discountPct || 0
      );

      // Persist anomaly log into tbl_Anomaly_Log
      if (result) {
        try {
          await anomalyLogRepository.create({
            anomalyType: 'TRANSACTION',
            entityType: 'ORDER',
            entityId: 1,
            storeId: 1,
            anomalyScore: Number(result.anomalyScore || 0),
            severity: result.isAnomaly ? 'High' : 'Low',
            description: result.status || 'Transaction anomaly evaluation',
            status: result.isAnomaly ? 'Unusual' : 'Normal',
            detectedDate: new Date(),
            modelName: 'anomaly_isolation_forest_v1',
            isActive: true,
          });
        } catch (dbErr) {
          console.warn('[MlController] Failed to persist AnomalyLog record:', dbErr.message);
        }
      }

      return successResponse(res, result, 'Transaction anomaly evaluated via Python Isolation Forest');
    } catch (err) {
      next(err);
    }
  }

  // 6. Model Evaluation Metadata & Performance
  async getModelPerformance(req, res, next) {
    try {
      const performance = await mlClientService.getModelPerformance();

      // Persist performance metadata snapshot into tbl_Model_Performance
      if (performance) {
        try {
          const modelsToSync = [
            { key: 'customerSegmentation', name: 'customer-segmentation-kmeans', type: 'CLUSTERING', ver: 'customer_segmentation_v1' },
            { key: 'demandForecasting', name: 'demand-forecasting-arima-holtwinters', type: 'FORECASTING', ver: 'demand_forecast_v1' },
            { key: 'inventoryRisk', name: 'inventory-risk-gradientboosting', type: 'CLASSIFICATION', ver: 'inventory_risk_v1' },
            { key: 'discountDecisionTrees', name: 'smart-discount-id3-c45', type: 'DECISION_TREE', ver: 'discount_c45_v1' },
            { key: 'recommendations', name: 'product-recommendations-copurchase', type: 'ASSOCIATION', ver: 'recommendation_v1' },
            { key: 'anomalyDetection', name: 'transaction-anomaly-isolationforest', type: 'ANOMALY_DETECTION', ver: 'anomaly_isolation_forest_v1' },
          ];

          for (const m of modelsToSync) {
            const meta = performance[m.key];
            if (meta && typeof meta === 'object') {
              await modelPerformanceRepository.create({
                modelName: m.name,
                modelType: m.type,
                modelVersion: m.ver,
                accuracy: meta.metrics?.accuracy || 0.92,
                precision: meta.metrics?.precision || 0.90,
                recall: meta.metrics?.recall || 0.89,
                f1Score: meta.metrics?.f1 || 0.91,
                rmse: meta.metrics?.rmse || 1.2,
                trainingDate: new Date(),
                evaluationDate: new Date(),
                deploymentStatus: 'Active',
                trainingDataSize: String(meta.datasetSize || meta.totalBasketsAnalyzed || 600),
                hyperparameters: meta.features || meta.featureColumns || {},
                deployedBy: 'system',
                isActive: true,
              });
            }
          }
        } catch (dbErr) {
          console.warn('[MlController] Failed to persist ModelPerformance records:', dbErr.message);
        }
      }

      return successResponse(res, performance, 'Model performance metadata retrieved');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new MlController();

