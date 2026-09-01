'use client';

import React from 'react';
import { Search, X } from 'lucide-react';
import { clsx } from 'clsx';
import { useAppSettings } from '@/context/AppSettingsContext';

export function SearchBar({
  value = '',
  onChange,
  onClear,
  placeholder,
  className = '',
}) {
  const { t } = useAppSettings();

  return (
    <div className={clsx('relative flex items-center w-full max-w-md', className)}>
      <div className="absolute left-3 pointer-events-none text-slate-400 dark:text-slate-500">
        <Search className="w-4 h-4" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || t('searchPlaceholder')}
        className="w-full pl-9 pr-8 py-2 rounded-lg text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors shadow-sm"
      />
      {value && (
        <button
          type="button"
          onClick={() => {
            onChange('');
            if (onClear) onClear();
          }}
          className="absolute right-2.5 p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
