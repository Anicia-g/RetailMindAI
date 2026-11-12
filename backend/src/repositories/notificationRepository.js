const BaseRepository = require('./baseRepository');

class NotificationRepository extends BaseRepository {
  constructor() {
    super('tbl_Notification', 'int_Notification_Id');
  }

  toDTO(entity) {
    if (!entity) return null;
    return {
      notificationId: entity.int_Notification_Id,
      id: String(entity.int_Notification_Id),
      userId: entity.int_User_Id,
      type: entity.txt_Notification_Type || 'SYSTEM',
      notificationType: entity.txt_Notification_Type || 'SYSTEM',
      title: entity.txt_Title,
      message: entity.txt_Message,
      priority: entity.txt_Priority_Level || 'Normal',
      priorityLevel: entity.txt_Priority_Level || 'Normal',
      isRead: Boolean(entity.bit_Is_Read?.[0] ?? entity.bit_Is_Read),
      readDate: entity.dte_Read_Date,
      referenceType: entity.txt_Reference_Type,
      referenceId: entity.int_Reference_Id,
      sentDate: entity.dte_Sent_Date,
      channel: entity.txt_Channel || 'In-App',
      deliveryStatus: entity.txt_Delivery_Status || 'Sent',
      actionUrl: entity.txt_Action_Url,
      storeId: entity.int_Store_Id,
      expiryDate: entity.dte_Expiry_Date,
      isActive: Boolean(entity.bit_IsActive?.[0] ?? entity.bit_IsActive),
      createdAt: entity.dte_Created_Date,
      updatedAt: entity.dte_Modified_Date,
    };
  }

  toEntity(dto) {
    if (!dto) return null;
    const entity = {};
    if (dto.notificationId !== undefined || dto.id !== undefined) {
      entity.int_Notification_Id = dto.notificationId || dto.id;
    }
    if (dto.userId !== undefined) entity.int_User_Id = dto.userId;
    if (dto.type !== undefined || dto.notificationType !== undefined) {
      entity.txt_Notification_Type = dto.type || dto.notificationType;
    }
    if (dto.title !== undefined) entity.txt_Title = dto.title;
    if (dto.message !== undefined) entity.txt_Message = dto.message;
    if (dto.priority !== undefined || dto.priorityLevel !== undefined) {
      entity.txt_Priority_Level = dto.priority || dto.priorityLevel;
    }
    if (dto.isRead !== undefined) entity.bit_Is_Read = dto.isRead ? 1 : 0;
    if (dto.readDate !== undefined) entity.dte_Read_Date = dto.readDate;
    if (dto.referenceType !== undefined) entity.txt_Reference_Type = dto.referenceType;
    if (dto.referenceId !== undefined) entity.int_Reference_Id = dto.referenceId;
    if (dto.sentDate !== undefined) {
      entity.dte_Sent_Date = dto.sentDate;
    } else {
      entity.dte_Sent_Date = new Date();
    }
    if (dto.channel !== undefined) entity.txt_Channel = dto.channel;
    if (dto.deliveryStatus !== undefined) entity.txt_Delivery_Status = dto.deliveryStatus;
    if (dto.actionUrl !== undefined) entity.txt_Action_Url = dto.actionUrl;
    if (dto.storeId !== undefined) entity.int_Store_Id = dto.storeId;
    if (dto.expiryDate !== undefined) entity.dte_Expiry_Date = dto.expiryDate;
    if (dto.isActive !== undefined) entity.bit_IsActive = dto.isActive ? 1 : 0;
    return entity;
  }
}

module.exports = new NotificationRepository();
