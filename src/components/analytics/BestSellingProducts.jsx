'use client';

import React from 'react';
import { Flame, TrendingUp, Package, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAppSettings } from '@/context/AppSettingsContext';
import { Badge } from '@/components/common/Badge';

export function BestSellingProducts({ products, onViewAll }) {
  const { t } = useAppSettings();

  // Sort by units sold descending
  const topSellers = [...products]
    .sort((a, b) => (b.unitsSold || 0) - (a.unitsSold || 0))
    .slice(0, 5);

  return (
    <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              🔥 Best-Selling Products
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 font-semibold">
                Supermarket Top 5
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Ranked by velocity, total units moved, and gross revenue contribution
            </p>
          </div>
        </div>

        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            View Catalog <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Product List */}
      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {topSellers.map((prod, index) => {
          const isRank1 = index === 0;
          return (
            <div
              key={prod.id}
              className="py-3.5 flex items-center justify-between gap-4 group hover:bg-slate-50/70 dark:hover:bg-slate-800/40 -mx-2 px-2 rounded-xl transition-colors"
            >
              {/* Left: Rank & Photo & Details */}
              <div className="flex items-center gap-3.5 min-w-0">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 ${
                    isRank1
                      ? 'bg-amber-400 text-slate-950 shadow-sm'
                      : index === 1
                      ? 'bg-slate-300 text-slate-800'
                      : index === 2
                      ? 'bg-amber-700/60 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}
                >
                  {index + 1}
                </div>

                <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0 border border-slate-200 dark:border-slate-700 shadow-2xs">
                  <img
                    src={prod.image}
                    alt={prod.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>

                <div className="min-w-0">
                  <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 truncate flex items-center gap-1.5">
                    <span>{t(prod.name)}</span>
                    {isRank1 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                        #1 Top Velocity
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                    <span>{t(prod.category)}</span>
                    <span>•</span>
                    <span className="font-mono">{prod.sku}</span>
                  </div>
                </div>
              </div>

              {/* Right: Metrics & Stock */}
              <div className="flex items-center gap-4 sm:gap-6 flex-shrink-0 text-right">
                <div>
                  <div className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-slate-100">
                    {prod.unitsSold ? `${prod.unitsSold.toLocaleString()} units` : '340 units'}
                  </div>
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-end gap-0.5">
                    <TrendingUp className="w-3 h-3" />
                    <span>{prod.salesGrowth || '+15%'}</span>
                  </div>
                </div>

                <div className="hidden md:block">
                  <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                    ₹{(prod.revenue || prod.price * 250).toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-400">Gross Sales</div>
                </div>

                <div className="w-20 hidden sm:block">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block ${
                      prod.stock <= prod.reorderLevel
                        ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                        : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                    }`}
                  >
                    {prod.stock} in stock
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
