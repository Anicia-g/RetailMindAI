'use client';

import React, { createContext, useContext } from 'react';
import { useAppSettings } from './AppSettingsContext';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const { theme, dark, setTheme, toggleTheme } = useAppSettings();

  const value = {
    theme,
    dark,
    setTheme,
    toggleTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used inside ThemeProvider');
  }
  return context;
}
