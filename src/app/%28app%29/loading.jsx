'use client';

import React from 'react';

export default function AppLoading() {
  return (
    <div className="space-y-6 animate-pulse max-w-7xl mx-auto">
      {/* Top Banner Skeleton */}
      <div className="h-28 rounded-2xl bg-slate-200 dark:bg-slate-800/80 w-full" />

      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 rounded-xl bg-slate-200 dark:bg-slate-800/60 p-5 space-y-3">
            <div className="h-3 w-24 bg-slate-300 dark:bg-slate-700 rounded" />
            <div className="h-8 w-32 bg-slate-300 dark:bg-slate-700 rounded" />
            <div className="h-3 w-20 bg-slate-300 dark:bg-slate-700 rounded" />
          </div>
        ))}
      </div>

      {/* Main Charts & Content Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-72 rounded-2xl bg-slate-200 dark:bg-slate-800/60 p-5 space-y-4">
          <div className="h-4 w-40 bg-slate-300 dark:bg-slate-700 rounded" />
          <div className="h-52 bg-slate-300/60 dark:bg-slate-700/40 rounded-xl" />
        </div>
        <div className="h-72 rounded-2xl bg-slate-200 dark:bg-slate-800/60 p-5 space-y-4">
          <div className="h-4 w-32 bg-slate-300 dark:bg-slate-700 rounded" />
          <div className="h-52 bg-slate-300/60 dark:bg-slate-700/40 rounded-xl" />
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="h-64 rounded-2xl bg-slate-200 dark:bg-slate-800/60 p-5 space-y-3">
        <div className="h-4 w-48 bg-slate-300 dark:bg-slate-700 rounded" />
        <div className="space-y-2 pt-2">
          {[1, 2, 3, 4].map((r) => (
            <div key={r} className="h-10 bg-slate-300/50 dark:bg-slate-700/40 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
