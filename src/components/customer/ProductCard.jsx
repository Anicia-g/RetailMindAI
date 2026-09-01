'use client';

import React from 'react';
import { Plus, Check, Star, ShoppingBag, Eye, Heart } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useAppSettings } from '@/context/AppSettingsContext';

export function ProductCard({ product, onQuickView }) {
  const { addToCart, cart, toggleWishlist, isInWishlist } = useAuth();
  const { t } = useAppSettings();

  const inCart = cart.some((item) => item.id === product.id);
  const isWished = isInWishlist(product.id);
  const originalPrice = product.originalPrice || Math.round(product.price * 1.18);
  const savings = Math.max(0, originalPrice - product.price);
  const discountPct = product.discountPct || Math.round((savings / originalPrice) * 100);

  return (
    <div className="p-3.5 sm:p-4 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs hover:shadow-lg transition-all duration-200 flex flex-col justify-between group relative">
      <div>
        {/* Photo Container */}
        <div className="relative w-full h-40 sm:h-44 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 mb-3 border border-slate-100 dark:border-slate-800/80">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />

          {/* Discount Chip */}
          {discountPct > 0 && (
            <div className="absolute top-2 left-2 px-2 py-0.5 rounded-lg bg-rose-600 text-white text-[10px] font-black shadow-sm">
              {discountPct}% OFF
            </div>
          )}

          {/* Wishlist Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleWishlist(product);
            }}
            className={`absolute top-2 right-2 p-1.5 rounded-full backdrop-blur-md transition-all shadow-sm cursor-pointer ${
              isWished
                ? 'bg-rose-50 dark:bg-rose-950 text-rose-500 ring-2 ring-rose-400'
                : 'bg-white/80 dark:bg-slate-900/80 text-slate-400 hover:text-rose-500'
            }`}
            title={isWished ? 'Remove from Wishlist' : 'Add to Wishlist'}
          >
            <Heart className={`w-3.5 h-3.5 ${isWished ? 'fill-rose-500' : ''}`} />
          </button>

          {/* Quick View Button */}
          {onQuickView && (
            <button
              onClick={() => onQuickView(product)}
              className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm cursor-pointer"
              title="Quick View"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Stock Status Badge */}
          {product.stock <= product.reorderLevel && (
            <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-rose-950/85 text-rose-300 text-[9px] font-bold backdrop-blur-xs">
              Only {product.stock} left in store
            </div>
          )}
        </div>

        {/* Category & Name */}
        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
          {t(product.category)}
        </div>
        <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 line-clamp-1 mt-0.5">
          {t(product.name)}
        </h4>

        {/* Rating & Unit */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
          <span>{product.unit}</span>
          <span className="flex items-center gap-1 font-bold text-amber-500">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            {product.rating || 4.8} ({product.ratingCount || 128})
          </span>
        </div>
      </div>

      {/* Price, Savings & Add to Cart Action */}
      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm sm:text-base font-black text-slate-900 dark:text-slate-100">
              ₹{product.price}
            </span>
            {savings > 0 && (
              <span className="text-xs text-slate-400 line-through">
                ₹{originalPrice}
              </span>
            )}
          </div>
          {savings > 0 && (
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block">
              Save ₹{savings}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => addToCart(product, 1)}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
            inCart
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20'
          }`}
        >
          {inCart ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          <span>{inCart ? t('inCart') : t('addToCart')}</span>
        </button>
      </div>
    </div>
  );
}
