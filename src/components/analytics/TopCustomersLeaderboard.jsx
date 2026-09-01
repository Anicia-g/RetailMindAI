'use client';

import React from 'react';
import { Trophy, Award, ShoppingBag, Calendar, Sparkles, ArrowRight } from 'lucide-react';
import { useAppSettings } from '@/context/AppSettingsContext';

export function TopCustomersLeaderboard({ customers, onViewAll }) {
  const { t } = useAppSettings();

  // Top 4 customers by monetary value
  const topList = [...customers]
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 4);

  return (
    <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              🏆 Top Customers Leaderboard
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-semibold">
                LTV Champions
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Ranked by total historical purchase value, frequency, and loyalty cohort
            </p>
          </div>
        </div>

        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            All Customers <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Top Customers Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {topList.map((cust, idx) => {
          const isRank1 = idx === 0;
          const isRank2 = idx === 1;
          const isRank3 = idx === 2;

          return (
            <div
              key={cust.id}
              className={`p-4 rounded-xl border transition-all flex flex-col justify-between relative ${
                isRank1
                  ? 'border-amber-400/60 bg-gradient-to-b from-amber-50/40 via-white to-amber-50/10 dark:from-amber-950/20 dark:via-slate-900 dark:to-slate-900 shadow-sm'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-slate-300'
              }`}
            >
              {/* Rank Medal Chip */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-xs font-black px-2 py-0.5 rounded-md ${
                      isRank1
                        ? 'bg-amber-400 text-slate-950 shadow-xs'
                        : isRank2
                        ? 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
                        : isRank3
                        ? 'bg-amber-700/30 text-amber-900 dark:text-amber-300'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}
                  >
                    {isRank1 ? '🥇 Rank 1' : isRank2 ? '🥈 Rank 2' : isRank3 ? '🥉 Rank 3' : `#${idx + 1}`}
                  </span>

                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                    {cust.tag || 'VIP'}
                  </span>
                </div>
              </div>

              {/* Avatar & Name */}
              <div className="flex items-center gap-3">
                <img
                  src={cust.avatar}
                  alt={cust.name}
                  className="w-11 h-11 rounded-full object-cover border-2 border-white dark:border-slate-700 shadow-xs flex-shrink-0"
                  loading="lazy"
                />
                <div className="min-w-0">
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 truncate">
                    {cust.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 truncate">{cust.email}</p>
                </div>
              </div>

              {/* Spending Metrics */}
              <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Total Spend:</span>
                  <span className="font-black text-slate-900 dark:text-slate-100">
                    ₹{cust.totalSpent.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 dark:text-slate-400">Orders / AOV:</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    {cust.orders} orders (₹{cust.aov || Math.round(cust.totalSpent / cust.orders)})
                  </span>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                  <span>Last Order:</span>
                  <span className="font-medium text-slate-600 dark:text-slate-300">{cust.lastPurchase || 'Recent'}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
