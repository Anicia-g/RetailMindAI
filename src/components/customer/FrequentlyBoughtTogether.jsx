'use client';

import React, { useState } from 'react';
import { Layers, Sparkles, Plus, Check, ShoppingBag, ArrowRight } from 'lucide-react';
import { supermarketDeals } from '@/data/deals';
import { useAuth } from '@/context/AuthContext';
import { useAppSettings } from '@/context/AppSettingsContext';

export function FrequentlyBoughtTogether() {
  const { addToCart } = useAuth();
  const { t } = useAppSettings();
  const [addedBundles, setAddedBundles] = useState({});

  const handleAddBundle = (deal) => {
    deal.items.forEach((item) => {
      addToCart({
        id: `bundle-${item.name}`,
        name: item.name,
        price: Math.round(item.price * (1 - deal.discountPct / 100)),
        originalPrice: item.price,
        image: item.img,
        unit: 'Pcs',
      });
    });
    setAddedBundles({ ...addedBundles, [deal.id]: true });
    setTimeout(() => {
      setAddedBundles((prev) => ({ ...prev, [deal.id]: false }));
    }, 2000);
  };

  return (
    <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              🧺 Frequently Bought Together
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-semibold">
                AI Bundle Savings
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Curated market basket affinity bundles with automated combo discounts
            </p>
          </div>
        </div>
      </div>

      {/* Bundles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {supermarketDeals.map((deal) => {
          const isAdded = !!addedBundles[deal.id];

          return (
            <div
              key={deal.id}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col justify-between space-y-3"
            >
              <div>
                {/* Title & Badge */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                    {deal.badge}
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                    Save ₹{deal.savings}
                  </span>
                </div>

                <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 mt-2">
                  {deal.title}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                  {deal.description}
                </p>

                {/* Items Thumbnails with Plus signs */}
                <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                  {deal.items.map((it, idx) => (
                    <React.Fragment key={idx}>
                      <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex-shrink-0" title={it.name}>
                        <img src={it.img} alt={it.name} className="w-full h-full object-cover" />
                      </div>
                      {idx < deal.items.length - 1 && (
                        <span className="text-slate-400 font-bold text-xs">+</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Price & Add Bundle Button */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                <div>
                  <span className="text-xs text-slate-400 line-through mr-1.5">₹{deal.originalTotal}</span>
                  <span className="text-sm font-black text-slate-900 dark:text-slate-100">
                    ₹{deal.bundlePrice}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleAddBundle(deal)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                    isAdded
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black shadow-sm'
                  }`}
                >
                  {isAdded ? <Check className="w-3.5 h-3.5" /> : <ShoppingBag className="w-3.5 h-3.5" />}
                  <span>{isAdded ? 'Bundle Added!' : 'Add Bundle'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
