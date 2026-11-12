const BaseRepository = require('./baseRepository');

class DemandForecastRepository extends BaseRepository {
  constructor() {
    super('tbl_Demand_Forecast', 'int_Demand_Forecast_Id');
  }

  toDTO(entity) {
    if (!entity) return null;
    return {
      forecastId: entity.int_Demand_Forecast_Id,
      id: String(entity.int_Demand_Forecast_Id),
      productId: entity.int_Product_Id,
      storeId: entity.int_Store_Id,
      forecastDate: entity.dte_Forecast_Date,
      periodType: entity.txt_Forecast_Period_Type || 'DAILY',
      forecastedQuantity: Number(entity.int_Forecasted_Quantity) || 0,
      predictedDemand: Number(entity.dec_Predicted_Demand || entity.int_Forecasted_Quantity || 0),
      confidenceScore: Number(entity.dec_Confidence_Score) || 0.95,
      lowerConfidenceBound: Number(entity.dec_Lower_Confidence_Bound) || null,
      upperConfidenceBound: Number(entity.dec_Upper_Confidence_Bound) || null,
      historicalAverage: Number(entity.dec_Historical_Average) || null,
      modelName: entity.txt_Model_Name || 'RandomForestRegressor',
      modelVersion: entity.txt_Model_Version || 'v2.4.1',
      generatedDate: entity.dte_Generated_Date,
      isActive: Boolean(entity.bit_IsActive?.[0] ?? entity.bit_IsActive),
      createdAt: entity.dte_Created_Date,
      updatedAt: entity.dte_Modified_Date,
    };
  }

  toEntity(dto) {
    if (!dto) return null;
    const entity = {};
    if (dto.forecastId !== undefined || dto.id !== undefined) {
      entity.int_Demand_Forecast_Id = dto.forecastId || dto.id;
    }
    if (dto.productId !== undefined) entity.int_Product_Id = dto.productId;
    if (dto.storeId !== undefined) entity.int_Store_Id = dto.storeId;
    if (dto.forecastDate !== undefined) {
      entity.dte_Forecast_Date = dto.forecastDate ? this.formatDate(dto.forecastDate) : this.formatDate(new Date());
    } else {
      entity.dte_Forecast_Date = this.formatDate(new Date());
    }
    if (dto.periodType !== undefined) entity.txt_Forecast_Period_Type = dto.periodType;
    if (dto.forecastedQuantity !== undefined) {
      entity.int_Forecasted_Quantity = dto.forecastedQuantity;
    }
    if (dto.predictedDemand !== undefined) {
      entity.dec_Predicted_Demand = dto.predictedDemand;
      if (entity.int_Forecasted_Quantity === undefined) {
        entity.int_Forecasted_Quantity = Math.round(dto.predictedDemand);
      }
    }
    if (dto.lowerConfidenceBound !== undefined || dto.lowerBound !== undefined) {
      entity.dec_Lower_Confidence_Bound = dto.lowerConfidenceBound ?? dto.lowerBound;
    }
    if (dto.upperConfidenceBound !== undefined || dto.upperBound !== undefined) {
      entity.dec_Upper_Confidence_Bound = dto.upperConfidenceBound ?? dto.upperBound;
    }
    if (dto.historicalAverage !== undefined) entity.dec_Historical_Average = dto.historicalAverage;
    if (dto.confidenceScore !== undefined) entity.dec_Confidence_Score = dto.confidenceScore;
    if (dto.modelName !== undefined) entity.txt_Model_Name = dto.modelName;
    if (dto.modelVersion !== undefined) entity.txt_Model_Version = dto.modelVersion;
    if (dto.generatedDate !== undefined) {
      entity.dte_Generated_Date = dto.generatedDate ? this.formatDateTime(dto.generatedDate) : this.formatDateTime(new Date());
    }
    if (dto.isActive !== undefined) entity.bit_IsActive = dto.isActive ? 1 : 0;
    return entity;
  }
}

module.exports = new DemandForecastRepository();
