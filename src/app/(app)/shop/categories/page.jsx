'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight, ShoppingBag } from 'lucide-react';
import { categoryImages } from '@/lib/images';

export const allSupermarketCategories = [
  {
    id: 'fruits',
    name: 'Fruits & Vegetables',
    desc: 'Farm-fresh organic apples, bananas, broccoli, greens & seasonal produce',
    itemCount: '52 Items',
    image: categoryImages['Fruits & Vegetables'],
    badge: 'Farm Direct',
    color: 'from-emerald-600 to-teal-500',
  },
  {
    id: 'dairy',
    name: 'Dairy & Eggs',
    desc: 'Fresh whole milk, Greek yogurt, artisanal cheese, farm eggs & butter',
    itemCount: '24 Items',
    image: categoryImages['Dairy & Eggs'],
    badge: 'Fresh Daily',
    color: 'from-blue-600 to-cyan-500',
  },
  {
    id: 'bakery',
    name: 'Bakery & Snacks',
    desc: 'Artisan sourdough, whole wheat loaves, crunchy cookies & organic granola',
    itemCount: '38 Items',
    image: categoryImages['Bakery & Snacks'],
    badge: 'Oven Fresh',
    color: 'from-amber-600 to-yellow-500',
  },
  {
    id: 'grains',
    name: 'Rice & Grains',
    desc: 'Royal Basmati rice, quinoa, whole grains, pasta & cold-pressed oils',
    itemCount: '19 Items',
    image: categoryImages['Rice & Grains'],
    badge: 'Pantry Staples',
    color: 'from-orange-600 to-amber-500',
  },
  {
    id: 'beverages',
    name: 'Beverages',
    desc: 'Arabica coffee beans, organic green teas, pure cold-pressed juices & coolers',
    itemCount: '28 Items',
    image: categoryImages['Beverages'],
    badge: '100% Pure',
    color: 'from-purple-600 to-indigo-500',
  },
  {
    id: 'personal-care',
    name: 'Personal Care',
    desc: 'Eco handwash, herbal wellness, organic toiletries & daily essentials',
    itemCount: '22 Items',
    image: categoryImages['Personal Care'],
    badge: 'Gentle & Pure',
    color: 'from-pink-600 to-rose-500',
  },
  {
    id: 'household',
    name: 'Household',
    desc: 'Recycled paper towels, eco dishwash, surface cleaners & storage organizers',
    itemCount: '31 Items',
    image: categoryImages['Home & Lifestyle'],
    badge: 'Eco Friendly',
    color: 'from-teal-600 to-emerald-500',
  },
  {
    id: 'frozen',
    name: 'Frozen Foods',
    desc: 'Quick-freeze berries, ready-to-cook treats, frozen peas & gourmet gelatos',
    itemCount: '18 Items',
    image: categoryImages['Frozen Foods'],
    badge: 'Flash Frozen',
    color: 'from-cyan-600 to-blue-500',
  },
  {
    id: 'gourmet',
    name: 'Groceries & Gourmet',
    desc: 'Imported sauces, organic maple, virgin olive oil & exotic spices',
    itemCount: '45 Items',
    image: categoryImages['Groceries & Gourmet'],
    badge: 'Chef Select',
    color: 'from-indigo-600 to-purple-500',
  },
];

export default function ShopCategoriesPage() {
  const router = useRouter();

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Complete Supermarket Aisles</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">
          Shop by Grocery Category
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
          Explore curated supermarket aisles loaded with farm-fresh produce, dairy essentials, wholesome pantry staples, and household favorites.
        </p>
      </div>

      {/* Visual Category Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {allSupermarketCategories.map((cat) => (
          <Link
            key={cat.id}
            href={`/shop/products?category=${encodeURIComponent(cat.name)}`}
            className="group p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-4 hover:-translate-y-1"
          >
            <div className="space-y-3">
              <div className="relative w-full h-44 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider">
                  {cat.badge}
                </div>
                <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-white/90 dark:bg-slate-900/90 text-slate-900 dark:text-slate-100 text-xs font-black shadow-sm">
                  {cat.itemCount}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  {cat.desc}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <span>Explore {cat.name}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
