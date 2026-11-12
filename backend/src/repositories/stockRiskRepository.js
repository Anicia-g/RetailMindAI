const BaseRepository = require('./baseRepository');

class StockRiskRepository extends BaseRepository {
  constructor() {
    super('tbl_Stock_Risk', 'int_Stock_Risk_Id');
  }

  toDTO(entity) {
    if (!entity) return null;
    return {
      riskId: entity.int_Stock_Risk_Id,
      id: String(entity.int_Stock_Risk_Id),
      productId: entity.int_Product_Id,
      storeId: entity.int_Store_Id,
      riskType: entity.txt_Risk_Type || 'STOCKOUT_RISK',
      riskCategory: entity.txt_Risk_Category || 'STOCKOUT',
      riskLevel: entity.txt_Risk_Level || 'LOW',
      riskScore: Number(entity.dec_Risk_Score) || 0,
      daysUntilStockout: Number(entity.int_Days_Until_Stockout) || 0,
      currentStockLevel: Number(entity.int_Current_Stock_Level) || 0,
      predictedDemand: Number(entity.int_Predicted_Demand) || 0,
      stockoutProbability: Number(entity.dec_Stockout_Probability) || 0,
      excessStockProbability: Number(entity.dec_Excess_Stock_Probability) || 0,
      holdingCostImpact: Number(entity.dec_Holding_Cost_Impact) || 0,
      recommendedAction: entity.txt_Recommended_Action,
      analysisDate: entity.dte_Analysis_Date,
      modelName: entity.txt_Model_Name || 'InventoryRiskClassifier',
      isActive: Boolean(entity.bit_IsActive?.[0] ?? entity.bit_IsActive),
      createdAt: entity.dte_Created_Date,
      updatedAt: entity.dte_Modified_Date,
    };
  }

  toEntity(dto) {
    if (!dto) return null;
    const entity = {};
    if (dto.riskId !== undefined || dto.id !== undefined) {
      entity.int_Stock_Risk_Id = dto.riskId || dto.id;
    }
    if (dto.productId !== undefined) entity.int_Product_Id = dto.productId;
    if (dto.storeId !== undefined) entity.int_Store_Id = dto.storeId;
    if (dto.riskType !== undefined) entity.txt_Risk_Type = dto.riskType;
    if (dto.riskCategory !== undefined) entity.txt_Risk_Category = dto.riskCategory;
    if (dto.riskLevel !== undefined) entity.txt_Risk_Level = dto.riskLevel;
    if (dto.riskScore !== undefined) entity.dec_Risk_Score = dto.riskScore;
    if (dto.daysUntilStockout !== undefined) entity.int_Days_Until_Stockout = dto.daysUntilStockout;
    if (dto.currentStockLevel !== undefined) entity.int_Current_Stock_Level = dto.currentStockLevel;
    if (dto.predictedDemand !== undefined) entity.int_Predicted_Demand = dto.predictedDemand;
    if (dto.stockoutProbability !== undefined) entity.dec_Stockout_Probability = dto.stockoutProbability;
    if (dto.excessStockProbability !== undefined) entity.dec_Excess_Stock_Probability = dto.excessStockProbability;
    if (dto.holdingCostImpact !== undefined) entity.dec_Holding_Cost_Impact = dto.holdingCostImpact;
    if (dto.recommendedAction !== undefined) entity.txt_Recommended_Action = dto.recommendedAction;
    if (dto.analysisDate !== undefined) entity.dte_Analysis_Date = dto.analysisDate ? this.formatDateTime(dto.analysisDate) : this.formatDateTime(new Date());
    if (dto.modelName !== undefined) entity.txt_Model_Name = dto.modelName;
    if (dto.isActive !== undefined) entity.bit_IsActive = dto.isActive ? 1 : 0;
    return entity;
  }
}

module.exports = new StockRiskRepository();
