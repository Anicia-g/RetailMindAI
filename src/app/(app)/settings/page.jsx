'use client';

import React, { useState } from 'react';
import {
  Settings,
  Palette,
  Globe,
  Type,
  CheckCircle2,
  RotateCcw,
  Save,
  Sun,
  Moon,
  Sparkles,
  Sliders
} from 'lucide-react';
import { useAppSettings, DEFAULT_SETTINGS } from '@/context/AppSettingsContext';
import { Button } from '@/components/common/Button';
import { Select } from '@/components/common/Select';
import { Input } from '@/components/common/Input';
import { Badge } from '@/components/common/Badge';

export default function SettingsPage() {
  const {
    settings,
    language,
    theme,
    dark,
    backgroundColor,
    fontColor,
    fontSize,
    saveStatus,
    setLanguage,
    setTheme,
    setBackgroundColor,
    setFontColor,
    setFontSize,
    updateSettings,
    saveSettings,
    resetSettings,
    t,
  } = useAppSettings();

  const [notification, setNotification] = useState(null);

  const handleSave = () => {
    const success = saveSettings();
    if (success) {
      setNotification({ type: 'success', message: t('settingsSavedSuccessfully') });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleReset = () => {
    const success = resetSettings();
    if (success) {
      setNotification({ type: 'info', message: t('settingsResetSuccessfully') });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const presetThemes = [
    {
      name: t('defaultTheme'),
      theme: 'light',
      bg: '#f8fafc',
      font: '#0f172a',
    },
    {
      name: t('slateEnterprise'),
      theme: 'dark',
      bg: '#0f172a',
      font: '#f8fafc',
    },
    {
      name: t('midnightBlue'),
      theme: 'dark',
      bg: '#0a0f1d',
      font: '#e2e8f0',
    },
    {
      name: t('emeraldClean'),
      theme: 'light',
      bg: '#f0fdf4',
      font: '#064e3b',
    },
  ];

  const applyPreset = (preset) => {
    updateSettings({
      theme: preset.theme,
      backgroundColor: preset.bg,
      fontColor: preset.font,
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-slate-100">{t('settingsTitle')}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t('settingsSubtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="md"
            icon={RotateCcw}
            onClick={handleReset}
          >
            {t('resetDefaults')}
          </Button>
          <Button
            variant="primary"
            size="md"
            icon={Save}
            onClick={handleSave}
            className="shadow-md shadow-indigo-600/20"
          >
            {t('saveSettings')}
          </Button>
        </div>
      </div>

      {/* Save Notification */}
      {notification && (
        <div
          className={`p-3.5 rounded-xl border flex items-center gap-2.5 text-xs font-semibold animate-fade-in ${
            notification.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300'
              : 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800/60 text-indigo-800 dark:text-indigo-300'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>{notification.message}</span>
        </div>
      )}

      {/* Section 1: Appearance & Theme Mode */}
      <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <Palette className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{t('appearance')}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Select application visual tone</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div
            onClick={() => setTheme('light')}
            className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-3.5 ${
              theme === 'light'
                ? 'border-indigo-600 bg-indigo-50/20 dark:bg-indigo-950/20'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
            }`}
          >
            <div className="p-2.5 rounded-xl bg-amber-100 text-amber-700">
              <Sun className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="font-bold text-xs text-slate-900 dark:text-slate-100">{t('lightTheme')}</div>
              <span className="text-[11px] text-slate-400">Crisp high-contrast daytime interface</span>
            </div>
            {theme === 'light' && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
          </div>

          <div
            onClick={() => setTheme('dark')}
            className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-3.5 ${
              theme === 'dark'
                ? 'border-indigo-600 bg-indigo-50/20 dark:bg-indigo-950/20'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
            }`}
          >
            <div className="p-2.5 rounded-xl bg-slate-800 text-slate-200">
              <Moon className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="font-bold text-xs text-slate-900 dark:text-slate-100">{t('darkTheme')}</div>
              <span className="text-[11px] text-slate-400">Enterprise deep slate dark mode</span>
            </div>
            {theme === 'dark' && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
          </div>
        </div>

        {/* Theme Presets */}
        <div className="pt-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
            {t('presetThemes')}
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {presetThemes.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => applyPreset(preset)}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-indigo-400 text-left transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-slate-400 shadow-2xs"
                    style={{ backgroundColor: preset.bg }}
                  />
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{preset.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Section 2: Global Language */}
      <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <Globe className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{t('languageSetting')}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Change localized interface text across all screens</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { code: 'en', name: 'English', native: 'English (US/UK)' },
            { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
            { code: 'hi', name: 'Hindi', native: 'हिंदी' },
          ].map((lang) => (
            <div
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                language === lang.code
                  ? 'border-indigo-600 bg-indigo-50/20 dark:bg-indigo-950/20'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="font-bold text-xs text-slate-900 dark:text-slate-100">{lang.name}</div>
                <span className="text-[11px] text-slate-400">{lang.native}</span>
              </div>
              {language === lang.code && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
            </div>
          ))}
        </div>
      </div>

      {/* Section 3: Typography Scaling */}
      <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <Type className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{t('typography')}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Adjust application-wide base font sizing</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              {t('fontSize')}: <strong className="text-indigo-600">{fontSize}px</strong>
            </span>
            <div className="flex items-center gap-1.5">
              {[13, 14, 15, 16, 18, 20].map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => setFontSize(sz)}
                  className={`px-2.5 py-1 text-xs rounded-lg font-bold transition-colors ${
                    fontSize === sz
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {sz}px
                </button>
              ))}
            </div>
          </div>

          <input
            type="range"
            min="12"
            max="22"
            step="1"
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            className="w-full accent-indigo-600 cursor-pointer"
          />

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs">
            <p className="text-slate-700 dark:text-slate-300">
              <strong>Preview:</strong> The system has analyzed your retail metrics. Current font size applies globally across navigation, cards, tables, and AI assistant dialogs.
            </p>
          </div>
        </div>
      </div>

      {/* Section 4: Color Customization */}
      <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <Sliders className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{t('colors')}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Custom background and primary text hex values</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 block mb-1.5">
              {t('backgroundColor')}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="w-10 h-10 rounded-lg cursor-pointer border border-slate-300 dark:border-slate-700 bg-transparent p-0.5"
              />
              <Input
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                placeholder="#f8fafc"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 block mb-1.5">
              {t('fontColor')}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={fontColor}
                onChange={(e) => setFontColor(e.target.value)}
                className="w-10 h-10 rounded-lg cursor-pointer border border-slate-300 dark:border-slate-700 bg-transparent p-0.5"
              />
              <Input
                value={fontColor}
                onChange={(e) => setFontColor(e.target.value)}
                placeholder="#0f172a"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Button variant="outline" size="md" icon={RotateCcw} onClick={handleReset}>
          {t('resetDefaults')}
        </Button>
        <Button variant="primary" size="md" icon={Save} onClick={handleSave}>
          {t('saveSettings')}
        </Button>
      </div>
    </div>
  );
}
