'use client';

import React, { useState } from 'react';
import { initialCustomerClusters } from '@/data/customers';

export function CustomerSegmentChart({ clusters = initialCustomerClusters, height = 240 }) {
  const [selectedCluster, setSelectedCluster] = useState(null);

  return (
    <div className="w-full">
      {/* 2D Scatter Representation of K-Means Clusters */}
      <div className="relative w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 p-4" style={{ height: `${height}px` }}>
        <div className="absolute top-2 left-4 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Frequency (High Orders ↑)
        </div>
        <div className="absolute bottom-2 right-4 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Monetary Spend (LTV →)
        </div>

        {/* Cluster visual bubbles */}
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Cluster 1: High Value Champions (Top Right) */}
          <div
            onClick={() => setSelectedCluster(clusters[0])}
            className="absolute top-4 right-10 p-3 rounded-2xl bg-indigo-500/15 border-2 border-indigo-500 text-indigo-700 dark:text-indigo-300 flex flex-col items-center justify-center cursor-pointer hover:scale-105 transition-transform duration-200 shadow-md"
            style={{ width: '130px', height: '85px' }}
          >
            <div className="w-3 h-3 rounded-full bg-indigo-500 mb-1" />
            <div className="text-xs font-bold text-center">Champions (18%)</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400">₹1.45L Avg LTV</div>
          </div>

          {/* Cluster 2: Loyal Regulars (Center) */}
          <div
            onClick={() => setSelectedCluster(clusters[1])}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-3 rounded-2xl bg-emerald-500/15 border-2 border-emerald-500 text-emerald-700 dark:text-emerald-300 flex flex-col items-center justify-center cursor-pointer hover:scale-105 transition-transform duration-200 shadow-md"
            style={{ width: '140px', height: '90px' }}
          >
            <div className="w-3 h-3 rounded-full bg-emerald-500 mb-1" />
            <div className="text-xs font-bold text-center">Loyal Regulars (48%)</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400">12 Orders Avg</div>
          </div>

          {/* Cluster 3: New / Emerging (Bottom Left) */}
          <div
            onClick={() => setSelectedCluster(clusters[2])}
            className="absolute bottom-4 left-6 p-2.5 rounded-2xl bg-cyan-500/15 border-2 border-cyan-500 text-cyan-700 dark:text-cyan-300 flex flex-col items-center justify-center cursor-pointer hover:scale-105 transition-transform duration-200 shadow-md"
            style={{ width: '120px', height: '75px' }}
          >
            <div className="w-3 h-3 rounded-full bg-cyan-500 mb-1" />
            <div className="text-xs font-bold text-center">New / Nurture (21%)</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400">Recent 7 Days</div>
          </div>

          {/* Cluster 4: At Risk / Churning (Bottom Right) */}
          <div
            onClick={() => setSelectedCluster(clusters[3])}
            className="absolute bottom-4 right-8 p-2.5 rounded-2xl bg-rose-500/15 border-2 border-rose-500 text-rose-700 dark:text-rose-300 flex flex-col items-center justify-center cursor-pointer hover:scale-105 transition-transform duration-200 shadow-md"
            style={{ width: '125px', height: '75px' }}
          >
            <div className="w-3 h-3 rounded-full bg-rose-500 mb-1" />
            <div className="text-xs font-bold text-center">At Risk (13%)</div>
            <div className="text-[10px] text-rose-500">Recency &gt; 70d</div>
          </div>
        </div>
      </div>

      {/* Cluster Details card */}
      <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
        {clusters.map((c) => (
          <div
            key={c.id}
            onClick={() => setSelectedCluster(c)}
            className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 cursor-pointer hover:border-indigo-400 transition-colors"
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
              {c.code}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{c.name}</div>
            <div className="text-xs font-extrabold text-slate-900 dark:text-slate-100 mt-0.5">{c.count} users ({c.percentOfTotal})</div>
          </div>
        ))}
      </div>
    </div>
  );
}
