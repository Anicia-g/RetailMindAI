'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  ShoppingBag,
  Heart,
  Search,
  Bot,
  User,
  LogOut,
  Sparkles,
  MapPin,
  Tag,
  Menu,
  X,
  ChevronDown,
  Sun,
  Moon,
  Clock,
  CheckCircle2,
  Package,
  Settings,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useAppSettings } from '@/context/AppSettingsContext';
import { useTheme } from '@/context/ThemeContext';
import { VoiceNavigation } from '@/components/voice/VoiceNavigation';

export function CustomerNavbar({ onOpenCartDrawer, onOpenAIAssistant }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, cartItemCount, cartTotal, wishlistItemCount } = useAuth();
  const { t, language, setLanguage } = useAppSettings();
  const { toggleTheme, dark } = useTheme();

  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const navLinks = [
    { label: t('supermarketHome'), href: '/shop' },
    { label: t('allProducts'), href: '/shop/products' },
    { label: t('categories'), href: '/shop/categories' },
    { label: t('dealsAndOffers'), href: '/shop/offers', highlight: true },
    { label: t('myOrders'), href: '/shop/orders' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-xs select-none">
      {/* Top Announcement Bar */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white text-[11px] font-bold py-1.5 px-4 text-center flex items-center justify-between">
        <div className="hidden sm:flex items-center gap-1.5 text-emerald-100">
          <MapPin className="w-3.5 h-3.5" />
          <span>{t('deliveringTo')}: <strong className="text-white">Indiranagar, Bangalore (560038)</strong></span>
        </div>
        <div className="flex-1 text-center flex items-center justify-center gap-2">
          <span>⚡ <strong>FRESH EXPRESS:</strong> {t('freeDeliveryBanner')}</span>
          <span className="hidden md:inline px-1.5 py-0.2 rounded bg-white/20 text-white font-mono text-[10px]">
            CODE: FRESH10
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-emerald-100">
          <Clock className="w-3.5 h-3.5" />
          <span>{t('instantDeliveryNotice')}</span>
        </div>
      </div>

      {/* Main Supermarket Nav Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link href="/shop" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-base tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-1">
                RetailMind <span className="text-emerald-600 dark:text-emerald-400">MART</span>
              </span>
              <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400">
                Fresh Supermarket
              </span>
            </div>
          </Link>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="hidden sm:flex flex-1 max-w-lg mx-2">
          <div className="relative w-full">
            <div className="absolute left-3.5 top-2.5 text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search fresh milk, fruits, bread, rice, coffee, snacks..."
              className="w-full pl-10 pr-20 py-2 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/90 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-colors"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1.5 px-3 py-1 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              {t('search')}
            </button>
          </div>
        </form>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language selector */}
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="hidden sm:block px-2 py-1 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer focus:outline-none"
          >
            <option value="en">English (EN)</option>
            <option value="ta">தமிழ் (TA)</option>
            <option value="hi">हिंदी (HI)</option>
          </select>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title={dark ? 'Light Mode' : 'Dark Mode'}
          >
            {dark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* Role-Aware Voice Navigation */}
          <VoiceNavigation
            onOpenAIAssistant={onOpenAIAssistant}
            onOpenCartDrawer={onOpenCartDrawer}
          />

          {/* AI Shopping Assistant ("Ask AI Grocer") */}
          <button
            onClick={onOpenAIAssistant}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-xs font-bold transition-all cursor-pointer shadow-2xs"
            title="Ask AI Grocery Assistant"
          >
            <Bot className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden md:inline">AI Grocer</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </button>

          {/* Wishlist Button */}
          <Link
            href="/shop/wishlist"
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 relative transition-colors"
            title="My Wishlist"
          >
            <Heart className="w-5 h-5" />
            {wishlistItemCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white font-black text-[10px] flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
                {wishlistItemCount}
              </span>
            )}
          </Link>

          {/* Shopping Cart Button */}
          <button
            onClick={onOpenCartDrawer}
            className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            title="Open Shopping Basket"
          >
            <div className="relative">
              <ShoppingBag className="w-4 h-4" />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 font-black text-[10px]">
                  {cartItemCount}
                </span>
              )}
            </div>
            <span className="hidden sm:inline font-mono font-black">
              ₹{cartTotal.toLocaleString()}
            </span>
          </button>

          {/* Customer Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-1.5 p-1 rounded-full hover:ring-2 hover:ring-emerald-500/40 transition-all cursor-pointer"
            >
              {user?.image ? (
                <img
                  src={user.image}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover border border-emerald-500 shadow-xs"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-bold text-xs flex items-center justify-center">
                  {user?.avatar || 'VM'}
                </div>
              )}
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-2 z-50 animate-fade-in text-slate-900 dark:text-slate-100">
                <div className="p-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100">{user?.name || 'Vikram Malhotra'}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user?.email || 'customer@retailmind.ai'}</div>
                  <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    450 SmartCoins (₹450)
                  </div>
                </div>

                <div className="py-1 space-y-0.5">
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      router.push('/shop/profile');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-left cursor-pointer"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    <span>{t('profile')}</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      router.push('/shop/orders');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-left cursor-pointer"
                  >
                    <Package className="w-4 h-4 text-slate-400" />
                    <span>{t('myOrders')}</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      router.push('/shop/wishlist');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-left cursor-pointer"
                  >
                    <Heart className="w-4 h-4 text-slate-400" />
                    <span>{t('wishlist')}</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      router.push('/settings');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-left cursor-pointer"
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    <span>{t('settings')}</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      logout();
                      router.push('/login');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors text-left cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{t('logout')}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sub-Header Supermarket Category / Navigation Bar */}
      <div className="border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 px-4 sm:px-6 hidden md:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto py-2 text-xs font-bold text-slate-700 dark:text-slate-300 gap-6">
          <div className="flex items-center gap-6">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`transition-colors whitespace-nowrap ${
                    isActive
                      ? 'text-emerald-600 dark:text-emerald-400 font-extrabold'
                      : link.highlight
                      ? 'text-amber-600 dark:text-amber-400 font-bold hover:text-amber-700'
                      : 'hover:text-emerald-600 dark:hover:text-emerald-400'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="text-[11px] text-slate-400 font-semibold flex items-center gap-2">
            <span>Customer Care: <strong>1800-419-MART</strong></span>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3 animate-fade-in">
          <form onSubmit={handleSearchSubmit} className="sm:hidden mb-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search groceries..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100"
            />
          </form>

          <div className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-xl text-xs font-bold ${
                  pathname === link.href
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
