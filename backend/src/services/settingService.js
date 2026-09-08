const Setting = require('../models/Setting');

class SettingService {
  async getAllSettings() {
    const settings = await Setting.find();
    const settingsMap = {};
    settings.forEach((s) => {
      settingsMap[s.key] = s.value;
    });
    return settingsMap;
  }

  async updateSetting(key, value, user = null) {
    const setting = await Setting.findOneAndUpdate(
      { key },
      { value, updatedBy: user?.name || 'Admin User' },
      { upsert: true, new: true }
    );
    return setting;
  }
}

module.exports = new SettingService();
