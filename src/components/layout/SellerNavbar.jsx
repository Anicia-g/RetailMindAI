'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  Menu,
  Sun,
  Moon,
  Bot,
  Bell,
  User,
  LogOut,
  AlertCircle,
  Clock,
  CheckCircle2,
  ChevronDown,
  Store,
  ShoppingCart,
  Zap,
  Settings,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useAppSettings } from '@/context/AppSettingsContext';
import { useTheme } from '@/context/ThemeContext';
import { SearchBar } from '@/components/common/SearchBar';
import { VoiceNavigation } from '@/components/voice/VoiceNavigation';

export function SellerNavbar({ onOpenMobileSidebar, onOpenAIAssistant, onOpenRecordSale }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { t, language, setLanguage } = useAppSettings();
  const { theme, toggleTheme, dark } = useTheme();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const profileRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const sellerNotifications = [
    {
      id: 'sn-1',
      title: 'Store Low Stock (Milk 1L)',
      desc: 'Only 18 units remaining in front aisle. Restock requested from backroom.',
      time: '12m ago',
      icon: AlertCircle,
      color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/40',
      route: '/seller/inventory',
    },
    {
      id: 'sn-2',
      title: 'Shift Target 80% Met!',
      desc: 'Great job! You are 6 orders away from hitting your shift quota bonus.',
      time: '1h ago',
      icon: CheckCircle2,
      color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40',
      route: '/seller/performance',
    },
    {
      id: 'sn-3',
      title: 'Approaching Expiry Discount (Bakery)',
      desc: '15% smart discount active on sourdough bread expiring in 2 days.',
      time: '3h ago',
      icon: Clock,
      color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/40',
      route: '/seller/inventory',
    },
  ];

  const getPageTitle = () => {
    if (!pathname) return t('sellerDashboard');
    if (pathname.includes('/seller/sales')) return t('shiftSalesPOS');
    if (pathname.includes('/seller/products')) return t('operationalCatalog');
    if (pathname.includes('/seller/inventory')) return t('storeInventoryAlerts');
    if (pathname.includes('/seller/customers')) return t('storeCustomers');
    if (pathname.includes('/seller/performance')) return t('sellerPerformance');
    if (pathname.includes('/seller/best-sellers')) return t('sellerBestSellers');
    if (pathname.includes('/seller/reports')) return t('sellerReports');
    if (pathname.includes('/seller/profile')) return t('sellerProfile');
    return t('sellerDashboard');
  };

  return (
    <header className="sticky top-0 z-30 h-16 w-full border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between gap-4 select-none">
      {/* Left: Mobile hamburger & Page Context */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          title="Open Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 hidden sm:block">
            <Store className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-slate-100">
              {getPageTitle()}
            </h1>
            <span className="text-[10px] text-slate-400 font-medium block sm:inline">
              {t('storeLocation')}: {user?.store || 'Indiranagar Flagship'}
            </span>
          </div>
        </div>
      </div>

      {/* Center: Search input */}
      <div className="hidden md:flex flex-1 max-w-md mx-4">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          onClear={() => setSearchQuery('')}
          placeholder={t('searchPlaceholder')}
        />
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Record Sale Button */}
        {onOpenRecordSale && (
          <button
            onClick={onOpenRecordSale}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-sm shadow-purple-600/30 transition-all cursor-pointer"
            title={t('recordSale')}
          >
            <ShoppingCart className="w-4 h-4" />
            <span className="hidden sm:inline">{t('recordSale')}</span>
          </button>
        )}

        {/* Language switcher */}
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="px-2 py-1 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer focus:outline-none"
        >
          <option value="en">English (EN)</option>
          <option value="ta">தமிழ் (TA)</option>
          <option value="hi">हिंदी (HI)</option>
        </select>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          title={dark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          {dark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {/* Role-Aware Voice Navigation */}
        <VoiceNavigation onOpenAIAssistant={onOpenAIAssistant} />

        {/* AI Assistant Trigger Button (Seller Co-Pilot) */}
        <button
          onClick={onOpenAIAssistant}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-sm shadow-purple-600/20 transition-all cursor-pointer"
          title="Open Seller AI Co-Pilot"
        >
          <Bot className="w-4 h-4" />
          <span className="hidden sm:inline">Seller AI</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        </button>

        {/* Notification Bell Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative cursor-pointer"
            title="Shift Alerts"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-purple-500 ring-2 ring-white dark:ring-slate-900" />
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-3 z-50 animate-fade-in text-slate-900 dark:text-slate-100">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 px-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Store & Shift Alerts</span>
                <span className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold cursor-pointer">Mark read</span>
              </div>

              <div className="space-y-1.5 mt-2">
                {sellerNotifications.map((n) => {
                  const Icon = n.icon;
                  return (
                    <div
                      key={n.id}
                      onClick={() => {
                        setIsNotifOpen(false);
                        router.push(n.route);
                      }}
                      className="p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer flex items-start gap-2.5 transition-colors"
                    >
                      <div className={`p-1.5 rounded-lg ${n.color} flex-shrink-0 mt-0.5`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-slate-800 dark:text-slate-200">{n.title}</div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">{n.desc}</p>
                        <span className="text-[10px] text-slate-400 font-medium block mt-1">{n.time}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Seller Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {user?.image ? (
              <img
                src={user.image}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover border border-purple-400 shadow-xs"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                {user?.avatar || 'PS'}
              </div>
            )}
            <div className="hidden xl:flex flex-col text-left">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">
                {user?.name || 'Priya Sharma'}
              </span>
              <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold uppercase">
                SELLER TERMINAL
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-2 z-50 animate-fade-in text-slate-900 dark:text-slate-100">
              <div className="p-3 border-b border-slate-100 dark:border-slate-800">
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100">{user?.name || 'Priya Sharma'}</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user?.email || 'seller@retailmind.ai'}</div>
                <div className="mt-1 text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 inline-block font-bold">
                  SELLER • {user?.store || 'Store 01'}
                </div>
              </div>

              <div className="py-1 space-y-0.5">
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    router.push('/seller/profile');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-left cursor-pointer"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  <span>{t('profile')}</span>
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
    </header>
  );
}
