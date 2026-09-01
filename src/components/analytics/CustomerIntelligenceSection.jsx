'use client';

import React from 'react';
import { Gem, Users, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';
import { useAppSettings } from '@/context/AppSettingsContext';

export function CustomerIntelligenceSection({ clusters, onOpenClusteringModal }) {
  const { t } = useAppSettings();

  return (
    <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400">
            <Gem className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              💎 Customer Intelligence & K-Means Clusters
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 font-semibold">
                K=4 Behavioral Cohorts
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              RFM (Recency, Frequency, Monetary) unsupervised ML customer profiling
            </p>
          </div>
        </div>

        {onOpenClusteringModal && (
          <button
            onClick={onOpenClusteringModal}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            Run Segmentation <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Visual Multi-Segment Bar */}
      <div className="w-full h-3 rounded-full overflow-hidden flex bg-slate-100 dark:bg-slate-800">
        {clusters.map((c) => (
          <div
            key={c.id}
            style={{
              width: c.percentOfTotal,
              backgroundColor: c.color,
            }}
            title={`${c.name}: ${c.percentOfTotal} (${c.count} accounts)`}
            className="h-full transition-all duration-500 first:rounded-l-full last:rounded-r-full"
          />
        ))}
      </div>

      {/* Cohort Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
        {clusters.map((c) => (
          <div
            key={c.id}
            className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{c.name}</span>
                </div>
                <span className="text-xs font-black text-slate-900 dark:text-slate-100">
                  {c.percentOfTotal}
                </span>
              </div>

              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-between">
                <span>{c.count} Active Buyers</span>
                <span className="font-mono text-[10px] text-slate-400">Churn: {c.churnRisk || 'Low'}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60 text-[11px] text-slate-600 dark:text-slate-300">
              <strong className="text-slate-800 dark:text-slate-200">Strategy:</strong> {c.strategy}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
