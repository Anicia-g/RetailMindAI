const BaseRepository = require('./baseRepository');

class ModelPerformanceRepository extends BaseRepository {
  constructor() {
    super('tbl_Model_Performance', 'int_Model_Performance_Id');
  }

  toDTO(entity) {
    if (!entity) return null;
    return {
      performanceId: entity.int_Model_Performance_Id,
      id: String(entity.int_Model_Performance_Id),
      modelName: entity.txt_Model_Name,
      modelType: entity.txt_Model_Type,
      modelVersion: entity.txt_Model_Version,
      accuracy: Number(entity.dec_Accuracy) || 0,
      precision: Number(entity.dec_Precision_Score) || 0,
      recall: Number(entity.dec_Recall_Score) || 0,
      f1Score: Number(entity.dec_F1_Score) || 0,
      rmse: Number(entity.dec_RMSE) || 0,
      trainingDate: entity.dte_Training_Date,
      evaluationDate: entity.dte_Evaluation_Date,
      deploymentStatus: entity.txt_Deployment_Status || 'Active',
      trainingDataSize: entity.txt_Training_Data_Size,
      deployedBy: entity.txt_Deployed_By,
      isActive: Boolean(entity.bit_IsActive?.[0] ?? entity.bit_IsActive),
      createdAt: entity.dte_Created_Date,
      updatedAt: entity.dte_Modified_Date,
    };
  }

  toEntity(dto) {
    if (!dto) return null;
    const entity = {};
    if (dto.performanceId !== undefined || dto.id !== undefined) {
      entity.int_Model_Performance_Id = dto.performanceId || dto.id;
    }
    if (dto.modelName !== undefined) entity.txt_Model_Name = dto.modelName;
    if (dto.modelType !== undefined) entity.txt_Model_Type = dto.modelType;
    if (dto.modelVersion !== undefined) entity.txt_Model_Version = dto.modelVersion;
    if (dto.accuracy !== undefined) entity.dec_Accuracy = dto.accuracy;
    if (dto.precision !== undefined) entity.dec_Precision_Score = dto.precision;
    if (dto.recall !== undefined) entity.dec_Recall_Score = dto.recall;
    if (dto.f1Score !== undefined) entity.dec_F1_Score = dto.f1Score;
    if (dto.rmse !== undefined) entity.dec_RMSE = dto.rmse;
    if (dto.trainingDate !== undefined) entity.dte_Training_Date = dto.trainingDate;
    if (dto.evaluationDate !== undefined) entity.dte_Evaluation_Date = dto.evaluationDate;
    if (dto.deploymentStatus !== undefined) entity.txt_Deployment_Status = dto.deploymentStatus;
    if (dto.trainingDataSize !== undefined) entity.txt_Training_Data_Size = dto.trainingDataSize;
    if (dto.deployedBy !== undefined) entity.txt_Deployed_By = dto.deployedBy;
    if (dto.isActive !== undefined) entity.bit_IsActive = dto.isActive ? 1 : 0;
    return entity;
  }
}

module.exports = new ModelPerformanceRepository();
