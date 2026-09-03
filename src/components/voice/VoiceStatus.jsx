'use client';

import React from 'react';
import {
  Mic,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  X,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  HelpCircle,
  Info,
} from 'lucide-react';

export function VoiceStatus({
  feedback,
  onClose,
  isListening,
  interimTranscript,
}) {
  if (!feedback && !isListening) return null;

  return (
    <div className="fixed top-20 right-4 sm:right-6 z-50 max-w-sm w-full animate-fade-in pointer-events-auto">
      {/* Live Interim Transcript Bubble while Listening */}
      {isListening && !feedback && (
        <div className="p-3.5 rounded-2xl bg-slate-900/95 text-white border border-rose-500/50 shadow-2xl backdrop-blur-xl flex items-center gap-3">
          <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 animate-pulse">
            <Mic className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-black uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
              <span>Listening for command...</span>
            </div>
            <p className="text-xs text-slate-300 truncate mt-0.5">
              {interimTranscript || 'Say "Open inventory", "Show sales", "Open shop"...'}
            </p>
          </div>
        </div>
      )}

      {/* Structured Feedback Toast */}
      {feedback && (
        <div
          className={`p-3.5 rounded-2xl border shadow-2xl backdrop-blur-xl flex flex-col gap-2.5 transition-all ${
            feedback.type === 'success'
              ? 'bg-emerald-950/95 border-emerald-500/50 text-white'
              : feedback.type === 'warning'
              ? 'bg-amber-950/95 border-amber-500/50 text-white'
              : feedback.type === 'error'
              ? 'bg-rose-950/95 border-rose-500/50 text-white'
              : 'bg-indigo-950/95 border-indigo-500/50 text-white'
          }`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`p-2 rounded-xl flex-shrink-0 mt-0.5 ${
                feedback.type === 'success'
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : feedback.type === 'warning'
                  ? 'bg-amber-500/20 text-amber-400'
                  : feedback.type === 'error'
                  ? 'bg-rose-500/20 text-rose-400'
                  : 'bg-indigo-500/20 text-indigo-400'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : feedback.type === 'warning' ? (
                <ShieldAlert className="w-4 h-4" />
              ) : feedback.type === 'error' ? (
                <AlertCircle className="w-4 h-4" />
              ) : (
                <Info className="w-4 h-4 text-indigo-400" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-black tracking-tight">{feedback.title}</span>
                {onClose && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="text-slate-400 hover:text-white p-0.5 rounded cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <p className="text-[11px] text-slate-200 mt-0.5 leading-relaxed">
                {feedback.message}
              </p>
            </div>
          </div>

          {/* Browser-Specific Helpful Tip if Permission Blocked */}
          {feedback.code === 'not-allowed' && (
            <div className="mt-1 p-2 rounded-xl bg-black/40 border border-amber-500/30 text-[10px] text-amber-200 space-y-1">
              <div className="font-bold flex items-center gap-1">
                <HelpCircle className="w-3 h-3" />
                <span>How to enable microphone:</span>
              </div>
              <p className="text-slate-300">
                • <strong>Safari:</strong> Safari &gt; Settings for localhost &gt; Microphone &gt; Allow
              </p>
              <p className="text-slate-300">
                • <strong>Chrome:</strong> Click 🔒 in address bar &gt; Site settings &gt; Microphone &gt; Allow
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
