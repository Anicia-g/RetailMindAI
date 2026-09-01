'use client';

import React from 'react';
import { supermarketCategories } from '@/data/categories';
import { useAppSettings } from '@/context/AppSettingsContext';

export function CategoryList({ selectedCategory, onSelectCategory }) {
  const { t, language } = useAppSettings();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          🥑 Supermarket Categories
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-semibold">
            Fresh & Packed
          </span>
        </h3>
        <span className="text-xs text-slate-400">Select to filter</span>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {supermarketCategories.map((cat) => {
          const isSelected = selectedCategory === cat.name;
          const displayName =
            language === 'ta' && cat.nameTa
              ? cat.nameTa
              : language === 'hi' && cat.nameHi
              ? cat.nameHi
              : cat.name;

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(isSelected ? 'All' : cat.name)}
              className={`group relative p-3 rounded-2xl border text-left overflow-hidden transition-all duration-200 cursor-pointer flex flex-col justify-between h-28 sm:h-32 ${
                isSelected
                  ? 'border-indigo-600 ring-2 ring-indigo-500 shadow-md scale-[1.02]'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 hover:shadow-xs'
              }`}
            >
              {/* Background Photo with Gradient Tint */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110 opacity-30 dark:opacity-20"
                style={{ backgroundImage: `url(${cat.image})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-white/80 to-white/40 dark:from-slate-900/95 dark:via-slate-900/80 dark:to-slate-900/40" />

              {/* Content */}
              <div className="relative z-10">
                <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-slate-100/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 backdrop-blur-xs">
                  {cat.tag}
                </span>
              </div>

              <div className="relative z-10">
                <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 leading-tight">
                  {displayName}
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {cat.itemCount}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
