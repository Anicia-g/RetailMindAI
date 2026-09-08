import { apiClient } from '@/lib/apiClient';

class SettingService {
  async getSettings() {
    try {
      const response = await apiClient.get('/settings');
      if (response && response.data) return response.data;
    } catch (e) {
      console.warn('[SettingService] Settings API unavailable:', e.message);
    }
    return null;
  }

  async updateSettings(settings) {
    try {
      const response = await apiClient.put('/settings', { settings });
      if (response && response.data) return response.data;
    } catch (e) {
      console.error('[SettingService] Error updating settings:', e.message);
    }
    return settings;
  }
}

export const settingService = new SettingService();
