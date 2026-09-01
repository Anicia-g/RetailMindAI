'use client';

import React, { useState } from 'react';
import { initialAnalytics } from '@/data/analytics';

export function SalesChart({ data = initialAnalytics.revenueTrendMonthly, height = 260 }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const maxVal = Math.max(...data.map((d) => Math.max(d.revenue, d.target))) * 1.15;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-indigo-600 dark:bg-indigo-500" />
            <span>Actual Revenue</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-dashed bg-slate-400 dark:bg-slate-500" />
            <span>Target Benchmark</span>
          </div>
        </div>
        {hoveredIdx !== null && data[hoveredIdx] && (
          <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 animate-fade-in">
            {data[hoveredIdx].month}: ₹{(data[hoveredIdx].revenue / 100000).toFixed(2)}L (Orders: {data[hoveredIdx].orders})
          </div>
        )}
      </div>

      <div className="relative w-full overflow-hidden" style={{ height: `${height}px` }}>
        {/* Horizontal grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20 dark:opacity-30">
          <div className="border-b border-slate-300 dark:border-slate-700 w-full" />
          <div className="border-b border-slate-300 dark:border-slate-700 w-full" />
          <div className="border-b border-slate-300 dark:border-slate-700 w-full" />
          <div className="border-b border-slate-300 dark:border-slate-700 w-full" />
        </div>

        {/* Bars and Target markers */}
        <div className="relative h-full flex items-end justify-between gap-2 pt-6 pb-6 px-2">
          {data.map((item, idx) => {
            const barHeightPct = (item.revenue / maxVal) * 100;
            const targetPct = (item.target / maxVal) * 100;
            const isHovered = hoveredIdx === idx;

            return (
              <div
                key={item.month}
                className="flex-1 flex flex-col items-center h-full justify-end relative group cursor-pointer"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                {/* Target Marker Line */}
                <div
                  className="absolute w-full border-t-2 border-dashed border-amber-500/80 z-10 transition-all"
                  style={{ bottom: `${targetPct}%` }}
                  title={`Target: ₹${item.target.toLocaleString()}`}
                />

                {/* Revenue Bar */}
                <div
                  className={`w-full max-w-[36px] rounded-t-md transition-all duration-300 ${
                    isHovered
                      ? 'bg-indigo-500 dark:bg-indigo-400 shadow-lg shadow-indigo-500/30'
                      : 'bg-indigo-600/90 dark:bg-indigo-600'
                  }`}
                  style={{ height: `${Math.max(barHeightPct, 4)}%` }}
                />

                {/* X Axis Label */}
                <span className="absolute -bottom-5 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  {item.month}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
