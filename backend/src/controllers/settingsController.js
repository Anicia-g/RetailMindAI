const settingService = require('../services/settingService');
const { successResponse } = require('../utils/apiResponse');

class SettingsController {
  async getSettings(req, res, next) {
    try {
      const settings = await settingService.getAllSettings();
      return successResponse(res, settings, 'System settings retrieved');
    } catch (err) {
      next(err);
    }
  }

  async updateSettings(req, res, next) {
    try {
      const updates = req.body;
      const updatedKeys = [];
      for (const [key, value] of Object.entries(updates)) {
        await settingService.updateSetting(key, value, req.user);
        updatedKeys.push(key);
      }
      return successResponse(res, { updatedKeys }, 'System settings updated');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new SettingsController();
