'use client';

import React, { forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ChevronDown } from 'lucide-react';

export const Select = forwardRef(function Select(
  {
    label,
    options = [],
    error,
    helperText,
    className = '',
    containerClassName = '',
    required = false,
    id,
    placeholder,
    ...props
  },
  ref
) {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={twMerge('w-full flex flex-col gap-1.5', containerClassName)}>
      {label && (
        <label htmlFor={selectId} className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <div className="relative flex items-center">
        <select
          id={selectId}
          ref={ref}
          className={twMerge(
            clsx(
              'w-full appearance-none rounded-lg border px-3 py-2 pr-9 text-sm transition-colors cursor-pointer',
              'bg-white dark:bg-slate-900',
              'text-slate-900 dark:text-slate-100',
              'border-slate-300 dark:border-slate-700',
              'focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-400',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              error && 'border-rose-500',
              className
            )
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => {
            const isObj = typeof opt === 'object' && opt !== null;
            const value = isObj ? opt.value : opt;
            const labelText = isObj ? opt.label : opt;
            return (
              <option key={String(value)} value={value} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                {labelText}
              </option>
            );
          })}
        </select>
        <div className="absolute right-3 pointer-events-none text-slate-400 dark:text-slate-500">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>
      {error ? (
        <p className="text-xs text-rose-500 font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-slate-500 dark:text-slate-400">{helperText}</p>
      ) : null}
    </div>
  );
});
