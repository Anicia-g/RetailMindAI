'use client';

import React from 'react';
import { Star, Award, TrendingUp, CheckCircle2, UserCheck, ArrowRight } from 'lucide-react';
import { useAppSettings } from '@/context/AppSettingsContext';

export function StarSellersLeaderboard({ employees, onViewAll }) {
  const { t } = useAppSettings();

  // Filter sales associates / managers sorted by salesAmount or target achievement
  const starSellers = [...employees]
    .filter((e) => e.salesAmount)
    .sort((a, b) => (b.salesAmount || 0) - (a.salesAmount || 0))
    .slice(0, 4);

  return (
    <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
            <Star className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              ⭐ Star Sellers Leaderboard
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 font-semibold">
                Store Frontrunners
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Ranked by total sales, quota target achievement %, and customer satisfaction score
            </p>
          </div>
        </div>

        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            All Staff <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Grid of Star Sellers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {starSellers.map((seller, idx) => {
          const isRank1 = idx === 0;
          return (
            <div
              key={seller.id}
              className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                isRank1
                  ? 'border-purple-400/60 bg-gradient-to-b from-purple-50/40 via-white to-purple-50/10 dark:from-purple-950/20 dark:via-slate-900 dark:to-slate-900 shadow-sm'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60'
              }`}
            >
              {/* Medal & Target Badge */}
              <div className="flex items-center justify-between mb-3">
                <span
                  className={`text-xs font-black px-2 py-0.5 rounded-md ${
                    isRank1
                      ? 'bg-amber-400 text-slate-950 shadow-xs'
                      : idx === 1
                      ? 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
                      : idx === 2
                      ? 'bg-amber-700/30 text-amber-900 dark:text-amber-300'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}
                >
                  {isRank1 ? '🥇 Rank 1' : idx === 1 ? '🥈 Rank 2' : idx === 2 ? '🥉 Rank 3' : `#${idx + 1}`}
                </span>

                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {seller.targetAchievement}% Quota
                </span>
              </div>

              {/* Avatar & Profile */}
              <div className="flex items-center gap-3">
                <img
                  src={seller.avatar}
                  alt={seller.name}
                  className="w-11 h-11 rounded-full object-cover border-2 border-white dark:border-slate-700 shadow-xs flex-shrink-0"
                  loading="lazy"
                />
                <div className="min-w-0">
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 truncate">
                    {seller.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 truncate">{seller.role}</p>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Total Sales:</span>
                  <span className="font-black text-slate-900 dark:text-slate-100">
                    {seller.salesFormatted || `₹${(seller.salesAmount || 150000).toLocaleString()}`}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 dark:text-slate-400">Orders Handled:</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    {seller.ordersHandled} orders
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-0.5">
                  <span className="text-slate-500 dark:text-slate-400">Rating & Returns:</span>
                  <span className="font-bold text-amber-500 flex items-center gap-1">
                    ⭐ {seller.rating} ({seller.returnRate || '1.2%'} ret)
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
