const BaseRepository = require('./baseRepository');

class SettingRepository extends BaseRepository {
  constructor() {
    super('tbl_Settings', 'int_Setting_Id');
  }

  toDTO(entity) {
    if (!entity) return null;
    return {
      settingId: entity.int_Setting_Id,
      id: String(entity.int_Setting_Id),
      key: entity.txt_Setting_Key,
      settingKey: entity.txt_Setting_Key,
      value: entity.txt_Setting_Value,
      settingValue: entity.txt_Setting_Value,
      defaultValue: entity.txt_Default_Value,
      category: entity.txt_Setting_Category || 'General',
      settingCategory: entity.txt_Setting_Category || 'General',
      description: entity.txt_Setting_Description,
      settingDescription: entity.txt_Setting_Description,
      isEditable: Boolean(entity.bit_Is_Editable?.[0] ?? entity.bit_Is_Editable),
      isGlobal: Boolean(entity.bit_Is_Global?.[0] ?? entity.bit_Is_Global),
      requiresRestart: Boolean(entity.bit_Requires_Restart?.[0] ?? entity.bit_Requires_Restart),
      isActive: Boolean(entity.bit_IsActive?.[0] ?? entity.bit_IsActive),
      createdAt: entity.dte_Created_Date,
      updatedAt: entity.dte_Modified_Date,
    };
  }

  toEntity(dto) {
    if (!dto) return null;
    const entity = {};
    if (dto.settingId !== undefined || dto.id !== undefined) {
      entity.int_Setting_Id = dto.settingId || dto.id;
    }
    if (dto.key !== undefined || dto.settingKey !== undefined) {
      entity.txt_Setting_Key = dto.key || dto.settingKey;
    }
    if (dto.value !== undefined || dto.settingValue !== undefined) {
      entity.txt_Setting_Value = typeof dto.value === 'object' ? JSON.stringify(dto.value) : String(dto.value ?? dto.settingValue);
    }
    if (dto.defaultValue !== undefined) entity.txt_Default_Value = dto.defaultValue;
    if (dto.category !== undefined || dto.settingCategory !== undefined) {
      entity.txt_Setting_Category = dto.category || dto.settingCategory;
    }
    if (dto.description !== undefined || dto.settingDescription !== undefined) {
      entity.txt_Setting_Description = dto.description || dto.settingDescription;
    }
    if (dto.isEditable !== undefined) entity.bit_Is_Editable = dto.isEditable ? 1 : 0;
    if (dto.isGlobal !== undefined) entity.bit_Is_Global = dto.isGlobal ? 1 : 0;
    if (dto.requiresRestart !== undefined) entity.bit_Requires_Restart = dto.requiresRestart ? 1 : 0;
    if (dto.isActive !== undefined) entity.bit_IsActive = dto.isActive ? 1 : 0;
    return entity;
  }
}

module.exports = new SettingRepository();
