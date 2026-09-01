'use client';

import React from 'react';

export function InventoryChart({
  healthyCount = 18,
  lowStockCount = 6,
  criticalCount = 3,
}) {
  const total = healthyCount + lowStockCount + criticalCount || 1;
  const healthyPct = (healthyCount / total) * 100;
  const lowPct = (lowStockCount / total) * 100;
  const criticalPct = (criticalCount / total) * 100;

  return (
    <div className="w-full">
      {/* Visual Multi-Segment Bar */}
      <div className="w-full h-4 rounded-full overflow-hidden flex bg-slate-100 dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-slate-700">
        <div
          style={{ width: `${healthyPct}%` }}
          className="bg-emerald-500 rounded-l-full transition-all duration-500"
          title={`Healthy: ${healthyCount} products (${healthyPct.toFixed(0)}%)`}
        />
        <div
          style={{ width: `${lowPct}%` }}
          className="bg-amber-500 transition-all duration-500"
          title={`Low Stock: ${lowStockCount} products (${lowPct.toFixed(0)}%)`}
        />
        <div
          style={{ width: `${criticalPct}%` }}
          className="bg-rose-500 rounded-r-full transition-all duration-500"
          title={`Critical: ${criticalCount} products (${criticalPct.toFixed(0)}%)`}
        />
      </div>

      {/* Legend & Stats */}
      <div className="grid grid-cols-3 gap-2 mt-4 text-center">
        <div className="p-2.5 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40">
          <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">Healthy Stock</div>
          <div className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-0.5">{healthyCount}</div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400">{healthyPct.toFixed(0)}% of Catalog</div>
        </div>

        <div className="p-2.5 rounded-lg bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40">
          <div className="text-xs font-semibold text-amber-700 dark:text-amber-400">Low Stock</div>
          <div className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-0.5">{lowStockCount}</div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400">{lowPct.toFixed(0)}% Warning</div>
        </div>

        <div className="p-2.5 rounded-lg bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40">
          <div className="text-xs font-semibold text-rose-700 dark:text-rose-400">Critical Out-of-Stock</div>
          <div className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-0.5">{criticalCount}</div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400">{criticalPct.toFixed(0)}% Immediate Action</div>
        </div>
      </div>
    </div>
  );
}
