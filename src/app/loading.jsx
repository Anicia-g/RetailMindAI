'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';

export default function RootLoading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 text-white select-none">
      {/* Background ambient blur */}
      <div className="absolute w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none animate-pulse-subtle" />
      <div className="absolute w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none [animation-delay:1s]" />

      <div className="relative z-10 flex flex-col items-center gap-6">
        {/* Animated Brand Logo Ring */}
        <div className="relative flex items-center justify-center w-20 h-20">
          <div className="absolute inset-0 rounded-2xl border-2 border-indigo-500/40 animate-ping opacity-50" />
          <div className="absolute inset-0 rounded-2xl border-2 border-indigo-400 border-t-transparent animate-spin" />
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-xl shadow-indigo-500/30">
            <Sparkles className="w-8 h-8 animate-pulse" />
          </div>
        </div>

        {/* Text and Status */}
        <div className="text-center space-y-2">
          <h2 className="text-xl font-black tracking-tight text-white flex items-center justify-center gap-1.5">
            RETAILMIND <span className="text-indigo-400">AI</span>
          </h2>
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-300">
            Initializing Intelligence Engine...
          </p>

          <div className="flex items-center justify-center gap-1.5 pt-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" />
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]" />
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.4s]" />
          </div>
        </div>
      </div>
    </div>
  );
}
