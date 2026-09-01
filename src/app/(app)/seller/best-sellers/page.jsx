'use client';

import React, { useState } from 'react';
import { Flame, Star, ShoppingCart, TrendingUp, Package, Trophy, ArrowRight, Store } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { initialProducts } from '@/data/products';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';

export default function SellerBestSellersPage() {
  const { user } = useAuth();
  const currentStore = user?.store || 'Indiranagar Flagship (Store 01)';

  const [products] = useState(initialProducts);

  const bestSellers = [...products]
    .sort((a, b) => (b.unitsSold || 0) - (a.unitsSold || 0));

  const handleQuickSale = (prod) => {
    window.dispatchEvent(new CustomEvent('open-record-sale-modal', { detail: prod }));
  };

  return (
    <div className="space-y-7 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
              STORE LEADERBOARD
            </span>
            <span className="text-xs text-slate-400">{currentStore.split('(')[0]}</span>
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2 mt-1">
            <Flame className="w-5 h-5 text-amber-500" />
            Store Best Sellers & High-Velocity SKUs
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Fastest moving products ranked by sales velocity, revenue contribution, and store demand.
          </p>
        </div>

        <Badge variant="purple" size="md">
          {bestSellers.length} Store SKUs Ranked
        </Badge>
      </div>

      {/* Leaderboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {bestSellers.map((prod, idx) => {
          const rank = idx + 1;
          const isTop3 = rank <= 3;
          const isSurging = prod.velocityChange?.startsWith('+');

          return (
            <div
              key={prod.id}
              className={`p-5 rounded-3xl border transition-all flex flex-col justify-between space-y-4 ${
                rank === 1
                  ? 'bg-gradient-to-b from-amber-50/70 via-white to-amber-50/20 dark:from-amber-950/30 dark:via-slate-900 dark:to-slate-900 border-amber-300 dark:border-amber-900/60 shadow-md'
                  : isTop3
                  ? 'bg-gradient-to-b from-purple-50/60 to-white dark:from-purple-950/30 dark:to-slate-900 border-purple-200 dark:border-purple-800 shadow-sm'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start gap-3.5">
                  <div className="relative">
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="w-16 h-16 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 flex-shrink-0"
                    />
                    <div
                      className={`absolute -top-2 -left-2 w-6 h-6 rounded-full flex items-center justify-center font-black text-xs shadow-md ${
                        rank === 1
                          ? 'bg-amber-400 text-slate-950 ring-2 ring-white dark:ring-slate-900'
                          : rank === 2
                          ? 'bg-slate-300 text-slate-900 ring-2 ring-white dark:ring-slate-900'
                          : rank === 3
                          ? 'bg-amber-700 text-white ring-2 ring-white dark:ring-slate-900'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      #{rank}
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 uppercase font-bold">{prod.category}</span>
                      <span className={`text-[10px] font-black ${isSurging ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {prod.salesGrowth || '+12%'}
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate mt-0.5">
                      {prod.name}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                      <span className="font-black text-slate-900 dark:text-slate-100">₹{prod.price}</span>
                      <span>•</span>
                      <span className="text-amber-500 font-bold flex items-center gap-0.5">
                        <Star className="w-3 h-3 fill-amber-400" /> {prod.rating || 4.8}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Units Sold</span>
                    <span className="font-black text-slate-900 dark:text-slate-100">{prod.unitsSold || 45}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Store Revenue</span>
                    <span className="font-black text-purple-600">₹{(prod.revenue || prod.price * (prod.unitsSold || 45)).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Current Stock</span>
                    <span className={`font-bold ${prod.stock <= prod.reorderLevel ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {prod.stock} in stock
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <Button
                  variant="primary"
                  size="sm"
                  icon={ShoppingCart}
                  onClick={() => handleQuickSale(prod)}
                  className="w-full bg-purple-600 hover:bg-purple-700 font-bold"
                >
                  Record Sale
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
