'use client';

import React, { useState } from 'react';
import {
  Tag,
  Sparkles,
  Flame,
  Clock,
  Copy,
  Check,
  Percent,
  Gift,
  ArrowRight,
  MessageSquare,
} from 'lucide-react';
import { initialProducts } from '@/data/products';
import { ProductCard } from '@/components/customer/ProductCard';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { WhatsAppOfferModal } from '@/components/customer/WhatsAppOfferModal';

export default function ShopOffersPage() {
  const [copiedCode, setCopiedCode] = useState('');
  const [products] = useState(initialProducts);
  const [selectedOfferForWhatsApp, setSelectedOfferForWhatsApp] = useState(null);

  const discountedProducts = products
    .filter((p) => (p.discountPct && p.discountPct > 0) || (p.expiryDays && p.expiryDays <= 6))
    .sort((a, b) => (b.discountPct || 0) - (a.discountPct || 0));

  const coupons = [
    {
      code: 'FRESH10',
      title: '10% Flat Instant Discount',
      desc: 'Valid on all Fresh Fruits, Vegetables, and Organic Dairy',
      minOrder: 'Min order ₹399',
      color: 'from-emerald-600 to-teal-500',
    },
    {
      code: 'RETAILMIND',
      title: '₹150 Supermarket Welcome Credit',
      desc: 'Instant cashback on your complete grocery basket checkout',
      minOrder: 'Min order ₹799',
      color: 'from-purple-600 to-indigo-500',
    },
    {
      code: 'BAKERY20',
      title: '20% Off Artisan Breads & Bakes',
      desc: 'Freshly baked sourdough, whole wheat loaves & tea cookies',
      minOrder: 'Min order ₹249',
      color: 'from-amber-600 to-yellow-500',
    },
  ];

  const handleCopyCode = (code) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 2500);
  };

  return (
    <div className="space-y-10 pb-16">
      {/* Offers Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-950 text-white shadow-xl border border-emerald-800/40 relative overflow-hidden">
        <div className="max-w-2xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-black uppercase tracking-wider border border-emerald-400/30">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Supermarket Mega Deals & Smart Discounts</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
            Save Up to 40% on Daily Essentials Today!
          </h2>
          <p className="text-xs sm:text-sm text-emerald-200/90 leading-relaxed">
            Grab limited-time flash discounts on dairy, farm produce, oven-fresh bakery items, and high-velocity grocery bundles.
          </p>
        </div>
      </div>

      {/* Active Coupon Codes Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Gift className="w-5 h-5 text-emerald-600" />
            Exclusive Promo Coupons
          </h3>
          <span className="text-xs text-slate-400">Copy code & apply at checkout</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {coupons.map((c) => {
            const isCopied = copiedCode === c.code;
            return (
              <div
                key={c.code}
                className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between space-y-4 hover:border-emerald-400 transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-black text-xs px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      {c.code}
                    </span>
                    <Badge variant="success" size="sm">Active Today</Badge>
                  </div>
                  <h4 className="font-black text-sm text-slate-900 dark:text-slate-100">{c.title}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{c.desc}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedOfferForWhatsApp({
                      title: c.title,
                      code: c.code,
                      discountPct: 15,
                      reason: c.desc,
                    })}
                    className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800/60 transition-colors flex items-center gap-1 cursor-pointer"
                    title="Preview WhatsApp Alert"
                  >
                    <MessageSquare className="w-3 h-3" />
                    <span>WhatsApp</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCopyCode(c.code)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      isCopied
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 hover:text-emerald-600'
                    }`}
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isCopied ? 'Code Copied!' : 'Copy Code'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Discounted Products Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
              🏷️ Today's Best Supermarket Deals
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Discounts auto-applied directly on product items
            </p>
          </div>
          <Badge variant="danger" size="md">
            {discountedProducts.length} Items on Sale
          </Badge>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {discountedProducts.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      </div>

      {/* WhatsApp Offer Notification Preview Modal */}
      <WhatsAppOfferModal
        isOpen={!!selectedOfferForWhatsApp}
        onClose={() => setSelectedOfferForWhatsApp(null)}
        offer={selectedOfferForWhatsApp}
      />
    </div>
  );
}
