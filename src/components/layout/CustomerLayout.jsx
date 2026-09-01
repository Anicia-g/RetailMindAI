'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  ShoppingBag,
  Tag,
  Heart,
  Package,
  Sparkles,
  ShieldCheck,
  Truck,
  RotateCcw,
  Headphones,
} from 'lucide-react';
import { CustomerNavbar } from './CustomerNavbar';
import { CartDrawer } from '@/components/customer/CartDrawer';
import { AIAssistantDrawer } from '@/components/intelligence/AIAssistantDrawer';
import { useAuth } from '@/context/AuthContext';
import { useAppSettings } from '@/context/AppSettingsContext';

export function CustomerLayout({ children }) {
  const pathname = usePathname();
  const { cartItemCount, wishlistItemCount } = useAuth();
  const { t } = useAppSettings();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);

  useEffect(() => {
    const handleOpenCart = () => {
      setIsCartOpen(true);
    };
    const handleOpenAI = () => {
      setIsAIAssistantOpen(true);
    };

    window.addEventListener('open-cart-drawer', handleOpenCart);
    window.addEventListener('open-ai-drawer', handleOpenAI);

    return () => {
      window.removeEventListener('open-cart-drawer', handleOpenCart);
      window.removeEventListener('open-ai-drawer', handleOpenAI);
    };
  }, []);

  const mobileNavItems = [
    { label: t('supermarketHome'), href: '/shop', icon: Home },
    { label: t('allProducts'), href: '/shop/products', icon: ShoppingBag },
    { label: t('dealsAndOffers'), href: '/shop/offers', icon: Tag, highlight: true },
    { label: t('wishlist'), href: '/shop/wishlist', icon: Heart, badge: wishlistItemCount },
    { label: t('myOrders'), href: '/shop/orders', icon: Package },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Supermarket Header */}
      <CustomerNavbar
        onOpenCartDrawer={() => setIsCartOpen(true)}
        onOpenAIAssistant={() => setIsAIAssistantOpen(true)}
      />

      {/* Main Supermarket Page Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 mb-16 md:mb-0 animate-fade-in">
        {children}
      </main>

      {/* Customer Trust Badges Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 mt-12 py-10 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Trust Guarantees */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-8 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">15-Min Delivery</h4>
                <p className="text-[11px] text-slate-500">Express delivery from local store</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex-shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">100% Farm Fresh</h4>
                <p className="text-[11px] text-slate-500">Hand-picked quality produce</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex-shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">Instant Refund</h4>
                <p className="text-[11px] text-slate-500">No questions asked return</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex-shrink-0">
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">24/7 AI Assistance</h4>
                <p className="text-[11px] text-slate-500">Smart grocery recipes & deals</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-black text-[10px]">
                RM
              </div>
              <span className="font-bold text-slate-700 dark:text-slate-300">RetailMind AI Supermarket Platform</span>
              <span>© 2026 RetailMind Inc. All rights reserved.</span>
            </div>
            <div className="flex items-center gap-4 text-[11px]">
              <Link href="/shop/products" className="hover:text-emerald-600">Fresh Produce</Link>
              <Link href="/shop/categories" className="hover:text-emerald-600">Aisles</Link>
              <Link href="/shop/offers" className="hover:text-emerald-600">Deals</Link>
              <Link href="/shop/orders" className="hover:text-emerald-600">My Orders</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-2 py-1.5 flex items-center justify-around select-none">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center py-1 px-2.5 rounded-xl text-[10px] font-bold relative transition-colors ${
                isActive
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Icon className="w-4 h-4 mb-0.5" />
              <span>{item.label}</span>
              {item.badge > 0 && (
                <span className="absolute top-0.5 right-1 w-3.5 h-3.5 rounded-full bg-rose-500 text-white font-bold text-[9px] flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Slide-out Customer Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />

      {/* Role-Aware Customer AI Assistant Drawer */}
      <AIAssistantDrawer
        isOpen={isAIAssistantOpen}
        onClose={() => setIsAIAssistantOpen(false)}
        role="CUSTOMER"
      />
    </div>
  );
}
