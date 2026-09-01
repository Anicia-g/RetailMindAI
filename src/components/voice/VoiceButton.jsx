'use client';

import React from 'react';
import { Mic, MicOff, Radio } from 'lucide-react';

export function VoiceButton({
  isListening,
  onClick,
  isSupported = true,
  className = '',
  size = 'md', // 'sm' | 'md'
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={isListening ? 'Stop voice command navigation' : 'Start voice command navigation'}
      title={
        !isSupported
          ? 'Voice navigation is not supported in this browser'
          : isListening
          ? '🔴 Listening... Click to stop'
          : '🎙️ Voice Navigation: Click to speak a command'
      }
      className={`relative inline-flex items-center justify-center rounded-xl transition-all cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
        isListening
          ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30 scale-105'
          : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
      } ${size === 'sm' ? 'p-1.5' : 'p-2'} ${className}`}
    >
      {/* Active Listening Ripple Animation */}
      {isListening && (
        <>
          <span className="absolute inset-0 rounded-xl bg-rose-500 animate-ping opacity-30 pointer-events-none" />
          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500" />
          </span>
        </>
      )}

      {isListening ? (
        <Mic className={size === 'sm' ? 'w-4 h-4 animate-pulse' : 'w-4 h-4 animate-pulse'} />
      ) : (
        <Mic className={size === 'sm' ? 'w-4 h-4' : 'w-4 h-4'} />
      )}
    </button>
  );
}
