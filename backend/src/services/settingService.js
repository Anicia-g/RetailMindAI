const settingRepository = require('../repositories/settingRepository');
const db = require('../config/db');

class SettingService {
  async getAllSettings() {
    const settings = await settingRepository.findAll({ isActive: true });
    const settingsMap = {};
    for (const s of settings) {
      settingsMap[s.key || s.settingKey] = s.value ?? s.settingValue;
    }
    return settingsMap;
  }

  async updateSetting(key, value, user = null) {
    const rows = await db.query(
      'SELECT * FROM tbl_Settings WHERE txt_Setting_Key = ? LIMIT 1',
      [key]
    );

    const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value ?? '');
    const userName = user?.name || user?.email || 'Admin User';

    if (rows.length > 0) {
      const settingId = rows[0].int_Setting_Id;
      await settingRepository.update(settingId, {
        value: stringValue,
        modifiedBy: userName,
      });
      return await settingRepository.findById(settingId);
    } else {
      const newSetting = await settingRepository.create({
        key,
        value: stringValue,
        defaultValue: stringValue,
        category: 'General',
        description: `Configuration for ${key}`,
        dataType: 'string',
        isEditable: true,
        isGlobal: true,
        requiresRestart: false,
        isActive: true,
        createdBy: userName,
        modifiedBy: userName,
      });
      return newSetting;
    }
  }
}

module.exports = new SettingService();
