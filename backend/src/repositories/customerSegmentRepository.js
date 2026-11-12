const BaseRepository = require('./baseRepository');

class CustomerSegmentRepository extends BaseRepository {
  constructor() {
    super('tbl_Customer_Segment', 'int_Customer_Segment_Id');
  }

  toDTO(entity) {
    if (!entity) return null;
    return {
      segmentId: entity.int_Customer_Segment_Id,
      id: String(entity.int_Customer_Segment_Id),
      customerId: entity.int_Customer_Id,
      segmentName: entity.txt_Segment_Name,
      segment: entity.txt_Segment_Name,
      description: entity.txt_Segment_Description,
      clusterId: Number(entity.int_Cluster_Id) || 0,
      recencyScore: Number(entity.dec_RFM_Recency_Score) || 0,
      frequencyScore: Number(entity.dec_RFM_Frequency_Score) || 0,
      monetaryScore: Number(entity.dec_RFM_Monetary_Score) || 0,
      churnProbability: Number(entity.dec_Churn_Probability) || 0,
      lifetimeValue: Number(entity.dec_Lifetime_Value) || 0,
      assignedDate: entity.dte_Segment_Assigned_Date,
      modelName: entity.txt_Model_Name || 'KMeansCustomerSegmentation',
      recommendedCampaign: entity.txt_Recommended_Campaign,
      colorCode: entity.txt_Segment_Color_Code,
      isCurrent: Boolean(entity.bit_Is_Current?.[0] ?? entity.bit_Is_Current),
      isActive: Boolean(entity.bit_IsActive?.[0] ?? entity.bit_IsActive),
      createdAt: entity.dte_Created_Date,
      updatedAt: entity.dte_Modified_Date,
    };
  }

  toEntity(dto) {
    if (!dto) return null;
    const entity = {};
    if (dto.segmentId !== undefined || dto.id !== undefined) {
      entity.int_Customer_Segment_Id = dto.segmentId || dto.id;
    }
    if (dto.customerId !== undefined) entity.int_Customer_Id = dto.customerId;
    if (dto.segmentName !== undefined || dto.segment !== undefined) {
      entity.txt_Segment_Name = dto.segmentName || dto.segment;
    }
    if (dto.description !== undefined) entity.txt_Segment_Description = dto.description;
    if (dto.clusterId !== undefined) entity.int_Cluster_Id = dto.clusterId;
    if (dto.recencyScore !== undefined) entity.dec_RFM_Recency_Score = dto.recencyScore;
    if (dto.frequencyScore !== undefined) entity.dec_RFM_Frequency_Score = dto.frequencyScore;
    if (dto.monetaryScore !== undefined) entity.dec_RFM_Monetary_Score = dto.monetaryScore;
    if (dto.churnProbability !== undefined) entity.dec_Churn_Probability = dto.churnProbability;
    if (dto.lifetimeValue !== undefined) entity.dec_Lifetime_Value = dto.lifetimeValue;
    if (dto.assignedDate !== undefined) entity.dte_Segment_Assigned_Date = dto.assignedDate ? this.formatDateTime(dto.assignedDate) : this.formatDateTime(new Date());
    if (dto.modelName !== undefined) entity.txt_Model_Name = dto.modelName;
    if (dto.recommendedCampaign !== undefined) entity.txt_Recommended_Campaign = dto.recommendedCampaign;
    if (dto.colorCode !== undefined) entity.txt_Segment_Color_Code = dto.colorCode;
    if (dto.isCurrent !== undefined) entity.bit_Is_Current = dto.isCurrent ? 1 : 0;
    if (dto.isActive !== undefined) entity.bit_IsActive = dto.isActive ? 1 : 0;
    return entity;
  }
}

module.exports = new CustomerSegmentRepository();
