'use client';

import React from 'react';
import { initialAnalytics } from '@/data/analytics';

export function CategoryChart({ data = initialAnalytics.categoryPerformance }) {
  const colors = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b'];

  return (
    <div className="w-full space-y-4">
      {data.map((cat, idx) => (
        <div key={cat.category} className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colors[idx % colors.length] }} />
              <span className="font-semibold text-slate-800 dark:text-slate-200">{cat.category}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-slate-500 dark:text-slate-400">₹{(cat.revenue / 100000).toFixed(1)}L ({cat.share}%)</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">{cat.growth}</span>
            </div>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${cat.share}%`,
                backgroundColor: colors[idx % colors.length]
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
