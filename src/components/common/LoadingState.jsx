'use client';

import React from 'react';

export function LoadingState({ message = 'Loading intelligence data...', className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center p-12 text-center ${className}`}>
      <div className="relative w-10 h-10 mb-3">
        <div className="absolute inset-0 rounded-full border-2 border-indigo-200 dark:border-indigo-900 animate-ping opacity-75"></div>
        <div className="w-10 h-10 rounded-full border-2 border-indigo-600 dark:border-indigo-400 border-t-transparent animate-spin"></div>
      </div>
      <p className="text-xs font-medium text-slate-600 dark:text-slate-400 animate-pulse-subtle">{message}</p>
    </div>
  );
}
