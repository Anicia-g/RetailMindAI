'use client';

import React from 'react';
import { clsx } from 'clsx';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export function StatCard({
  title,
  value,
  change,
  isPositive,
  subtitle,
  icon: Icon,
  badgeText,
  badgeVariant = 'default',
  className = '',
  onClick,
}) {
  return (
    <div
      onClick={onClick}
      className={clsx(
        'relative p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all duration-200 hover:shadow-md flex flex-col justify-between',
        onClick && 'cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-700',
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {title}
        </span>
        {Icon && (
          <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-3">
        <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          {value}
        </div>

        <div className="mt-2 flex items-center gap-2 flex-wrap text-xs">
          {change !== undefined && change !== null && (
            <span
              className={clsx(
                'inline-flex items-center gap-0.5 font-semibold px-1.5 py-0.5 rounded',
                isPositive === true
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                  : isPositive === false
                  ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                  : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
              )}
            >
              {isPositive === true ? (
                <TrendingUp className="w-3 h-3" />
              ) : isPositive === false ? (
                <TrendingDown className="w-3 h-3" />
              ) : (
                <Minus className="w-3 h-3" />
              )}
              {change}
            </span>
          )}

          {subtitle && (
            <span className="text-slate-500 dark:text-slate-400 truncate">
              {subtitle}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
