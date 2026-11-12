const BaseRepository = require('./baseRepository');

class ChatbotHistoryRepository extends BaseRepository {
  constructor() {
    super('tbl_Chatbot_History', 'int_Chatbot_History_Id');
  }

  toDTO(entity) {
    if (!entity) return null;
    return {
      chatId: entity.int_Chatbot_History_Id,
      id: String(entity.int_Chatbot_History_Id),
      userId: entity.int_User_Id,
      customerId: entity.int_Customer_Id,
      sessionId: entity.txt_Session_Id,
      userMessage: entity.txt_User_Message,
      message: entity.txt_User_Message,
      botResponse: entity.txt_Bot_Response,
      response: entity.txt_Bot_Response,
      intent: entity.txt_Intent_Detected,
      intentDetected: entity.txt_Intent_Detected,
      confidenceScore: Number(entity.dec_Confidence_Score) || 0.9,
      wasHelpful: Boolean(entity.bit_Was_Helpful?.[0] ?? entity.bit_Was_Helpful),
      interactionDate: entity.dte_Interaction_Date,
      modelName: entity.txt_Model_Name || 'Gemini-Flash-Retail',
      channel: entity.txt_Channel || 'Web',
      responseTimeMs: Number(entity.dec_Response_Time_Ms) || 0,
      escalatedTo: entity.txt_Escalated_To,
      storeId: entity.int_Store_Id,
      feedbackComment: entity.txt_Feedback_Comment,
      isActive: Boolean(entity.bit_IsActive?.[0] ?? entity.bit_IsActive),
      createdAt: entity.dte_Created_Date,
      updatedAt: entity.dte_Modified_Date,
    };
  }

  toEntity(dto) {
    if (!dto) return null;
    const entity = {};
    if (dto.chatId !== undefined || dto.id !== undefined) {
      entity.int_Chatbot_History_Id = dto.chatId || dto.id;
    }
    if (dto.userId !== undefined) entity.int_User_Id = dto.userId;
    if (dto.customerId !== undefined) entity.int_Customer_Id = dto.customerId;
    if (dto.sessionId !== undefined) entity.txt_Session_Id = dto.sessionId;
    if (dto.userMessage !== undefined || dto.message !== undefined) {
      entity.txt_User_Message = dto.userMessage || dto.message;
    }
    if (dto.botResponse !== undefined || dto.response !== undefined) {
      entity.txt_Bot_Response = dto.botResponse || dto.response;
    }
    if (dto.intent !== undefined || dto.intentDetected !== undefined) {
      entity.txt_Intent_Detected = dto.intent || dto.intentDetected;
    }
    if (dto.confidenceScore !== undefined) entity.dec_Confidence_Score = dto.confidenceScore;
    if (dto.wasHelpful !== undefined) entity.bit_Was_Helpful = dto.wasHelpful ? 1 : 0;
    entity.dte_Interaction_Date = dto.interactionDate ? this.formatDateTime(dto.interactionDate) : this.formatDateTime(new Date());
    if (dto.modelName !== undefined) entity.txt_Model_Name = dto.modelName;
    if (dto.channel !== undefined) entity.txt_Channel = dto.channel;
    if (dto.responseTimeMs !== undefined) entity.dec_Response_Time_Ms = dto.responseTimeMs;
    if (dto.escalatedTo !== undefined) entity.txt_Escalated_To = dto.escalatedTo;
    if (dto.storeId !== undefined) entity.int_Store_Id = dto.storeId;
    if (dto.feedbackComment !== undefined) entity.txt_Feedback_Comment = dto.feedbackComment;
    if (dto.isActive !== undefined) entity.bit_IsActive = dto.isActive ? 1 : 0;
    return entity;
  }
}

module.exports = new ChatbotHistoryRepository();
