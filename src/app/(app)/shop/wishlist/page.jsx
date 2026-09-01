'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, ShoppingBag, Plus, Trash2, ArrowRight, Star } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/common/Button';

export default function ShopWishlistPage() {
  const { wishlist, removeFromWishlist, addToCart, wishlistItemCount } = useAuth();

  const handleAddAllToCart = () => {
    wishlist.forEach((item) => {
      addToCart(item, 1);
    });
  };

  return (
    <div className="space-y-6 pb-16 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Heart className="w-6 h-6 text-rose-500 fill-rose-500" />
            My Saved Wishlist
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Keep track of favorite grocery items, organic snacks, and repeat pantry essentials.
          </p>
        </div>

        {wishlistItemCount > 0 && (
          <Button
            variant="primary"
            size="md"
            icon={ShoppingBag}
            onClick={handleAddAllToCart}
            className="bg-emerald-600 hover:bg-emerald-700 font-bold shadow-md shadow-emerald-600/30"
          >
            Add All ({wishlistItemCount}) to Cart
          </Button>
        )}
      </div>

      {wishlist.length === 0 ? (
        <div className="p-16 text-center rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
          <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-400 mx-auto flex items-center justify-center">
            <Heart className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-black text-slate-900 dark:text-slate-100">
              Your wishlist is currently empty
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Explore the supermarket catalog and click the heart icon on any product to save it here for later!
            </p>
          </div>
          <Link href="/shop/products">
            <Button variant="primary" size="md" className="bg-emerald-600 hover:bg-emerald-700 font-bold mt-2">
              Explore Grocery Catalog
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {wishlist.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between space-y-4 hover:border-emerald-300 transition-all"
            >
              <div className="flex items-start gap-3">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-16 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 flex-shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">{item.category}</span>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate mt-0.5">
                    {item.name}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-black text-sm text-slate-900 dark:text-slate-100">₹{item.price}</span>
                    <span className="text-xs text-slate-400">/ {item.unit}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => removeFromWishlist(item.id)}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  title="Remove from wishlist"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <Button
                  variant="primary"
                  size="sm"
                  icon={Plus}
                  onClick={() => {
                    addToCart(item, 1);
                    removeFromWishlist(item.id);
                  }}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 font-bold"
                >
                  Move to Cart
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
