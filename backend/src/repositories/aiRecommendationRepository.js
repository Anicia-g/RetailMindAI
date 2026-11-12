const BaseRepository = require('./baseRepository');

class AIRecommendationRepository extends BaseRepository {
  constructor() {
    super('tbl_AI_Recommendation', 'int_AI_Recommendation_Id');
  }

  toDTO(entity) {
    if (!entity) return null;
    return {
      recommendationId: entity.int_AI_Recommendation_Id,
      id: String(entity.int_AI_Recommendation_Id),
      type: entity.txt_Recommendation_Type,
      recommendationType: entity.txt_Recommendation_Type,
      productId: entity.int_Product_Id,
      customerId: entity.int_Customer_Id,
      storeId: entity.int_Store_Id,
      title: entity.txt_Recommendation_Text,
      description: entity.txt_Recommendation_Text,
      text: entity.txt_Recommendation_Text,
      confidenceScore: Number(entity.dec_Confidence_Score) || 0.9,
      status: entity.txt_Recommendation_Status || 'Pending',
      generatedDate: entity.dte_Generated_Date,
      expiryDate: entity.dte_Expiry_Date,
      reviewer: entity.txt_Reviewer,
      modelName: entity.txt_Model_Name || 'Hybrid-Recommendation-Engine',
      expectedRevenueImpact: Number(entity.dec_Expected_Revenue_Impact) || 0,
      expectedImpact: Number(entity.dec_Expected_Revenue_Impact) || 0,
      actionTaken: entity.txt_Action_Taken,
      actionDate: entity.dte_Action_Date,
      isActive: Boolean(entity.bit_IsActive?.[0] ?? entity.bit_IsActive),
      createdAt: entity.dte_Created_Date,
      updatedAt: entity.dte_Modified_Date,
    };
  }

  toEntity(dto) {
    if (!dto) return null;
    const entity = {};
    if (dto.recommendationId !== undefined || dto.id !== undefined) {
      entity.int_AI_Recommendation_Id = dto.recommendationId || dto.id;
    }
    if (dto.type !== undefined || dto.recommendationType !== undefined) {
      entity.txt_Recommendation_Type = dto.type || dto.recommendationType;
    }
    if (dto.productId !== undefined) entity.int_Product_Id = dto.productId;
    if (dto.customerId !== undefined) entity.int_Customer_Id = dto.customerId;
    if (dto.storeId !== undefined) entity.int_Store_Id = dto.storeId;
    if (dto.title !== undefined || dto.description !== undefined || dto.text !== undefined) {
      entity.txt_Recommendation_Text = dto.title || dto.description || dto.text;
    }
    if (dto.confidenceScore !== undefined) entity.dec_Confidence_Score = dto.confidenceScore;
    if (dto.status !== undefined) entity.txt_Recommendation_Status = dto.status;
    entity.dte_Generated_Date = dto.generatedDate ? this.formatDateTime(dto.generatedDate) : this.formatDateTime(new Date());
    if (dto.expiryDate !== undefined) entity.dte_Expiry_Date = dto.expiryDate ? this.formatDateTime(dto.expiryDate) : null;
    if (dto.reviewer !== undefined || dto.reviewedByUserId !== undefined) {
      entity.txt_Reviewer = dto.reviewer ? String(dto.reviewer) : (dto.reviewedByUserId ? String(dto.reviewedByUserId) : null);
    }
    if (dto.modelName !== undefined) entity.txt_Model_Name = dto.modelName;
    if (dto.expectedRevenueImpact !== undefined || dto.expectedImpact !== undefined) {
      entity.dec_Expected_Revenue_Impact = dto.expectedRevenueImpact !== undefined ? dto.expectedRevenueImpact : dto.expectedImpact;
    }
    if (dto.actionTaken !== undefined) entity.txt_Action_Taken = dto.actionTaken;
    if (dto.actionDate !== undefined) entity.dte_Action_Date = dto.actionDate ? this.formatDateTime(dto.actionDate) : null;
    if (dto.isActive !== undefined) entity.bit_IsActive = dto.isActive ? 1 : 0;
    return entity;
  }
}

module.exports = new AIRecommendationRepository();
