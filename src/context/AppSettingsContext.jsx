'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { translations } from '@/lib/translations';

export const DEFAULT_SETTINGS = {
  language: 'en',
  theme: 'light',
  backgroundColor: '#f8fafc',
  fontColor: '#0f172a',
  fontSize: 16,
};

export const DARK_DEFAULTS = {
  backgroundColor: '#0f172a',
  fontColor: '#f8fafc',
};

export const LIGHT_DEFAULTS = {
  backgroundColor: '#f8fafc',
  fontColor: '#0f172a',
};

const AppSettingsContext = createContext(null);

export function AppSettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [isInitialized, setIsInitialized] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // 'saved' | 'reset' | null

  // Apply CSS variables to root
  const applySettingsToDOM = useCallback((currentSettings) => {
    if (typeof window === 'undefined') return;

    const root = document.documentElement;
    const isDark = currentSettings.theme === 'dark';

    // Toggle dark class
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Set CSS variables
    root.style.setProperty('--app-background', currentSettings.backgroundColor);
    root.style.setProperty('--app-font-color', currentSettings.fontColor);
    root.style.setProperty('--app-font-size', `${currentSettings.fontSize}px`);

    if (document.body) {
      document.body.style.backgroundColor = currentSettings.backgroundColor;
      document.body.style.color = currentSettings.fontColor;
    }

    if (isDark) {
      root.style.setProperty('--app-surface', '#1e293b');
      root.style.setProperty('--app-surface-secondary', '#172033');
      root.style.setProperty('--app-border', '#334155');
      root.style.setProperty('--app-card', '#1e293b');
      root.style.setProperty('--app-input', '#0f172a');
      root.style.setProperty('--app-muted', '#94a3b8');
    } else {
      root.style.setProperty('--app-surface', '#ffffff');
      root.style.setProperty('--app-surface-secondary', '#f1f5f9');
      root.style.setProperty('--app-border', '#e2e8f0');
      root.style.setProperty('--app-card', '#ffffff');
      root.style.setProperty('--app-input', '#ffffff');
      root.style.setProperty('--app-muted', '#64748b');
    }
  }, []);

  // Initialize from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('retailmind_app_settings');
      if (stored) {
        const parsed = JSON.parse(stored);
        const merged = { ...DEFAULT_SETTINGS, ...parsed };
        setSettings(merged);
        applySettingsToDOM(merged);
      } else {
        applySettingsToDOM(DEFAULT_SETTINGS);
      }
    } catch (err) {
      console.error('Error loading settings from localStorage:', err);
      applySettingsToDOM(DEFAULT_SETTINGS);
    } finally {
      setIsInitialized(true);
    }
  }, [applySettingsToDOM]);

  // Helper to persist and apply settings
  const persistSettings = useCallback((updatedSettings) => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('retailmind_app_settings', JSON.stringify(updatedSettings));
      }
    } catch (e) {
      console.warn('Unable to persist settings to localStorage', e);
    }
    applySettingsToDOM(updatedSettings);
  }, [applySettingsToDOM]);

  // Setters for individual settings with instant persistence & DOM update
  const setLanguage = useCallback((lang) => {
    if (!lang) return;
    setSettings((prev) => {
      const updated = { ...prev, language: lang };
      persistSettings(updated);
      return updated;
    });
  }, [persistSettings]);

  const setTheme = useCallback((themeMode) => {
    setSettings((prev) => {
      const isDark = themeMode === 'dark';
      let newBg = prev.backgroundColor;
      let newFont = prev.fontColor;

      if (isDark && (newBg === LIGHT_DEFAULTS.backgroundColor || newBg === '#f8fafc' || newBg === '#ffffff')) {
        newBg = DARK_DEFAULTS.backgroundColor;
        newFont = DARK_DEFAULTS.fontColor;
      } else if (!isDark && (newBg === DARK_DEFAULTS.backgroundColor || newBg === '#0f172a' || newBg === '#111827')) {
        newBg = LIGHT_DEFAULTS.backgroundColor;
        newFont = LIGHT_DEFAULTS.fontColor;
      }

      const updated = {
        ...prev,
        theme: themeMode,
        backgroundColor: newBg,
        fontColor: newFont,
      };
      persistSettings(updated);
      return updated;
    });
  }, [persistSettings]);

  const toggleTheme = useCallback(() => {
    setSettings((prev) => {
      const nextTheme = prev.theme === 'dark' ? 'light' : 'dark';
      const isDark = nextTheme === 'dark';

      let newBg = isDark ? DARK_DEFAULTS.backgroundColor : LIGHT_DEFAULTS.backgroundColor;
      let newFont = isDark ? DARK_DEFAULTS.fontColor : LIGHT_DEFAULTS.fontColor;

      const updated = {
        ...prev,
        theme: nextTheme,
        backgroundColor: newBg,
        fontColor: newFont,
      };
      persistSettings(updated);
      return updated;
    });
  }, [persistSettings]);

  const setBackgroundColor = useCallback((color) => {
    setSettings((prev) => {
      const updated = { ...prev, backgroundColor: color };
      persistSettings(updated);
      return updated;
    });
  }, [persistSettings]);

  const setFontColor = useCallback((color) => {
    setSettings((prev) => {
      const updated = { ...prev, fontColor: color };
      persistSettings(updated);
      return updated;
    });
  }, [persistSettings]);

  const setFontSize = useCallback((size) => {
    const numericSize = Number(size) || 16;
    setSettings((prev) => {
      const updated = { ...prev, fontSize: numericSize };
      persistSettings(updated);
      return updated;
    });
  }, [persistSettings]);

  const updateSettings = useCallback((partial) => {
    setSettings((prev) => {
      const updated = { ...prev, ...partial };
      persistSettings(updated);
      return updated;
    });
  }, [persistSettings]);

  // Persist current settings to localStorage (Manual save button)
  const saveSettings = useCallback(() => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('retailmind_app_settings', JSON.stringify(settings));
      }
      applySettingsToDOM(settings);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(null), 3000);
      return true;
    } catch (err) {
      console.error('Failed to save settings to localStorage:', err);
      return false;
    }
  }, [settings, applySettingsToDOM]);

  // Reset to DEFAULT_SETTINGS
  const resetSettings = useCallback(() => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('retailmind_app_settings');
      }
      setSettings(DEFAULT_SETTINGS);
      applySettingsToDOM(DEFAULT_SETTINGS);
      setSaveStatus('reset');
      setTimeout(() => setSaveStatus(null), 3000);
      return true;
    } catch (err) {
      console.error('Failed to reset settings:', err);
      return false;
    }
  }, [applySettingsToDOM]);

  // Translation helper function
  const t = useCallback((key) => {
    if (key === undefined || key === null) return '';
    const strKey = String(key);
    const lang = settings.language || 'en';
    const langDict = translations[lang] || translations['en'] || {};
    const enDict = translations['en'] || {};
    return langDict[strKey] !== undefined ? langDict[strKey] : (enDict[strKey] !== undefined ? enDict[strKey] : strKey);
  }, [settings.language]);

  const value = {
    settings,
    language: settings.language,
    theme: settings.theme,
    dark: settings.theme === 'dark',
    backgroundColor: settings.backgroundColor,
    fontColor: settings.fontColor,
    fontSize: settings.fontSize,
    saveStatus,
    isInitialized,

    setLanguage,
    setTheme,
    toggleTheme,
    setBackgroundColor,
    setFontColor,
    setFontSize,
    updateSettings,

    saveSettings,
    resetSettings,
    t,
  };

  return (
    <AppSettingsContext.Provider value={value}>
      {children}
    </AppSettingsContext.Provider>
  );
}

export function useAppSettings() {
  const context = useContext(AppSettingsContext);
  if (!context) {
    throw new Error('useAppSettings must be used inside AppSettingsProvider');
  }
  return context;
}
