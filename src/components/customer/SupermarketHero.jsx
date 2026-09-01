'use client';

import React from 'react';
import { Sparkles, ShoppingBag, Truck, ShieldCheck, Tag, ArrowRight } from 'lucide-react';
import { useAppSettings } from '@/context/AppSettingsContext';
import { bannerImages } from '@/lib/images';

export function SupermarketHero({ onExploreDeals }) {
  const { t } = useAppSettings();

  return (
    <div className="relative rounded-3xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-800 bg-slate-900 text-white">
      {/* Background Photography with Gradient Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-35 mix-blend-overlay"
        style={{ backgroundImage: `url(${bannerImages.heroSupermarket})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-950/95 via-slate-900/90 to-indigo-950/70" />

      {/* Content Container */}
      <div className="relative z-10 p-6 sm:p-10 lg:p-12 flex flex-col justify-between space-y-6 max-w-2xl">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/30 border border-indigo-400/40 text-indigo-300 text-xs font-black uppercase tracking-wider backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>RetailMind AI Supermarket</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            Fresh Products. <br />
            <span className="bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">
              Better Prices.
            </span>{' '}
            Smarter Shopping.
          </h1>

          <p className="text-xs sm:text-sm text-indigo-100/90 max-w-xl leading-relaxed">
            Experience smart grocery shopping powered by real-time inventory freshness, algorithmic volume savings, and AI curated recommendation bundles.
          </p>
        </div>

        {/* Action Button & Badges */}
        <div className="flex flex-wrap items-center gap-4 pt-2">
          <button
            onClick={onExploreDeals}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-500/30 flex items-center gap-2 transition-all cursor-pointer"
          >
            <span>Explore Today's Best Deals</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-4 text-xs text-indigo-200/80">
            <span className="flex items-center gap-1.5 font-medium">
              <Truck className="w-4 h-4 text-emerald-400" /> Free 30-Min Delivery
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-4 h-4 text-cyan-400" /> 100% Quality Guaranteed
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
