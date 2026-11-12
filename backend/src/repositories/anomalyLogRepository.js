const BaseRepository = require('./baseRepository');

class AnomalyLogRepository extends BaseRepository {
  constructor() {
    super('tbl_Anomaly_Log', 'int_Anomaly_Log_Id');
  }

  toDTO(entity) {
    if (!entity) return null;
    return {
      anomalyId: entity.int_Anomaly_Log_Id,
      id: String(entity.int_Anomaly_Log_Id),
      anomalyType: entity.txt_Anomaly_Type,
      type: entity.txt_Anomaly_Type,
      entityType: entity.txt_Entity_Type,
      entityId: entity.int_Entity_Id,
      orderId: entity.int_Order_Id,
      storeId: entity.int_Store_Id,
      userId: entity.int_User_Id,
      anomalyScore: Number(entity.dec_Anomaly_Score) || 0,
      score: Number(entity.dec_Anomaly_Score) || 0,
      severity: entity.txt_Severity_Level || 'MEDIUM',
      severityLevel: entity.txt_Severity_Level || 'MEDIUM',
      description: entity.txt_Description,
      status: entity.txt_Detection_Status || 'FLAGGED',
      detectionStatus: entity.txt_Detection_Status || 'FLAGGED',
      detectedDate: entity.dte_Detected_Date,
      modelName: entity.txt_Model_Name || 'IsolationForestAnomalyDetector',
      isActive: Boolean(entity.bit_IsActive?.[0] ?? entity.bit_IsActive),
      createdAt: entity.dte_Created_Date,
      updatedAt: entity.dte_Modified_Date,
    };
  }

  toEntity(dto) {
    if (!dto) return null;
    const entity = {};
    if (dto.anomalyId !== undefined || dto.id !== undefined) {
      entity.int_Anomaly_Log_Id = dto.anomalyId || dto.id;
    }
    if (dto.anomalyType !== undefined || dto.type !== undefined) {
      entity.txt_Anomaly_Type = dto.anomalyType || dto.type;
    }
    if (dto.entityType !== undefined) entity.txt_Entity_Type = dto.entityType;
    if (dto.entityId !== undefined) entity.int_Entity_Id = dto.entityId;
    if (dto.orderId !== undefined) entity.int_Order_Id = dto.orderId;
    if (dto.storeId !== undefined) entity.int_Store_Id = dto.storeId;
    if (dto.userId !== undefined) entity.int_User_Id = dto.userId;
    if (dto.anomalyScore !== undefined || dto.score !== undefined) {
      entity.dec_Anomaly_Score = dto.anomalyScore !== undefined ? dto.anomalyScore : dto.score;
    }
    if (dto.severity !== undefined || dto.severityLevel !== undefined) {
      entity.txt_Severity_Level = dto.severity || dto.severityLevel;
    }
    if (dto.description !== undefined) entity.txt_Description = dto.description;
    if (dto.status !== undefined || dto.detectionStatus !== undefined) {
      entity.txt_Detection_Status = dto.status || dto.detectionStatus;
    }
    if (dto.detectedDate !== undefined) {
      entity.dte_Detected_Date = dto.detectedDate ? this.formatDateTime(dto.detectedDate) : this.formatDateTime(new Date());
    } else {
      entity.dte_Detected_Date = this.formatDateTime(new Date());
    }
    if (dto.modelName !== undefined) entity.txt_Model_Name = dto.modelName;
    if (dto.isActive !== undefined) entity.bit_IsActive = dto.isActive ? 1 : 0;
    return entity;
  }
}

module.exports = new AnomalyLogRepository();
