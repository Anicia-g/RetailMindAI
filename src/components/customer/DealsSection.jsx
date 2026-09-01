'use client';

import React from 'react';
import { Tag, Sparkles, Plus, Check, ShoppingBag, Clock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useAppSettings } from '@/context/AppSettingsContext';

export function DealsSection({ products }) {
  const { addToCart, cart } = useAuth();
  const { t } = useAppSettings();

  // Products with active discounts
  const dealProducts = products
    .filter((p) => p.discountPct && p.discountPct >= 10)
    .slice(0, 4);

  return (
    <div className="space-y-3">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400">
            <Tag className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              🏷️ Today's Best Deals
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500 text-white font-black animate-pulse">
                UP TO 20% OFF
              </span>
            </h3>
          </div>
        </div>

        <div className="text-xs text-slate-400 flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          <span>Limited daily stock</span>
        </div>
      </div>

      {/* Deals Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {dealProducts.map((prod) => {
          const inCart = cart.some((item) => item.id === prod.id);
          const savings = (prod.originalPrice || prod.price) - prod.price;

          return (
            <div
              key={prod.id}
              className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
            >
              <div>
                {/* Image Container with Badges */}
                <div className="relative w-full h-40 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 mb-3 border border-slate-100 dark:border-slate-800">
                  <img
                    src={prod.image}
                    alt={prod.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  {/* Discount Badge */}
                  <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-rose-600 text-white text-[11px] font-black shadow-md flex items-center gap-1">
                    <span>{prod.discountPct}% OFF</span>
                  </div>

                  {/* Savings Chip */}
                  <div className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-md bg-emerald-600/90 text-white text-[10px] font-bold backdrop-blur-xs shadow-xs">
                    Save ₹{savings}
                  </div>
                </div>

                {/* Meta */}
                <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                  {t(prod.category)}
                </div>
                <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 line-clamp-1 mt-0.5">
                  {t(prod.name)}
                </h4>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {prod.unit} • ⭐ {prod.rating} ({prod.ratingCount})
                </div>
              </div>

              {/* Price & Action */}
              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-base font-black text-slate-900 dark:text-slate-100">
                      ₹{prod.price}
                    </span>
                    <span className="text-xs text-slate-400 line-through">
                      ₹{prod.originalPrice}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => addToCart(prod, 1)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    inCart
                      ? 'bg-emerald-600 text-white'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-600/20'
                  }`}
                >
                  {inCart ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>{inCart ? 'Added' : 'Add to Cart'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
