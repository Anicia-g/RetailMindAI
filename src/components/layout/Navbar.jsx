'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  Menu,
  Sun,
  Moon,
  Bot,
  Bell,
  Sparkles,
  Settings,
  LogOut,
  AlertCircle,
  TrendingDown,
  CheckCircle2,
  ChevronDown,
  Shield,
  Crown,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useAppSettings } from '@/context/AppSettingsContext';
import { useTheme } from '@/context/ThemeContext';
import { SearchBar } from '@/components/common/SearchBar';
import { VoiceNavigation } from '@/components/voice/VoiceNavigation';

export function Navbar({ onOpenMobileSidebar, onOpenAIAssistant }) {
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

  // Close dropdowns on click outside
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

  const notifications = [
    {
      id: 'n-1',
      title: 'Critical Stock-out Risk (Farm Fresh Milk)',
      desc: 'Milk inventory expected to stock out in 31 hours (+24% velocity surge).',
      time: '10m ago',
      icon: AlertCircle,
      color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/40',
      route: '/inventory',
    },
    {
      id: 'n-2',
      title: 'Store 12 Revenue Deviation',
      desc: 'Bandra Central sales dropped 8% below target due to stockouts.',
      time: '45m ago',
      icon: TrendingDown,
      color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/40',
      route: '/stores',
    },
    {
      id: 'n-3',
      title: 'K-Means Customer Segmentation Updated',
      desc: 'RFM clustering refined 890 active supermarket accounts.',
      time: '2h ago',
      icon: CheckCircle2,
      color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40',
      route: '/customers',
    },
  ];

  const getPageTitleKey = () => {
    if (!pathname) return 'dashboard';
    const segment = pathname.split('/')[1] || 'dashboard';
    const map = {
      dashboard: 'dashboard',
      products: 'products',
      inventory: 'inventory',
      sales: 'sales',
      customers: 'customers',
      suppliers: 'suppliers',
      stores: 'stores',
      employees: 'employees',
      'purchase-orders': 'purchaseOrders',
      payments: 'payments',
      analytics: 'analytics',
      forecasting: 'forecasting',
      'ai-assistant': 'aiAssistant',
      reports: 'reports',
      settings: 'settings',
    };
    return map[segment] || 'dashboard';
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

        <div>
          <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            {t(getPageTitleKey())}
          </h1>
        </div>
      </div>

      {/* Center: Search input */}
      <div className="hidden md:flex flex-1 max-w-md mx-4">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          onClear={() => setSearchQuery('')}
          placeholder="Search products, suppliers, stores, analytics..."
        />
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Language quick switcher */}
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

        {/* AI Assistant Trigger Button */}
        <button
          onClick={onOpenAIAssistant}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm shadow-indigo-600/20 transition-all cursor-pointer"
          title="Open AI Assistant"
        >
          <Bot className="w-4 h-4" />
          <span className="hidden sm:inline">{t('aiAssistant')}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        </button>

        {/* Notification Bell Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-3 z-50 animate-fade-in text-slate-900 dark:text-slate-100">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 px-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Live AI Alerts</span>
                <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold cursor-pointer">Mark read</span>
              </div>

              <div className="space-y-1.5 mt-2">
                {notifications.map((n) => {
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

        {/* Admin Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {user?.image ? (
              <img
                src={user.image}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover border border-indigo-400 shadow-xs"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-400 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                {user?.avatar || 'AU'}
              </div>
            )}
            <div className="hidden xl:flex flex-col text-left">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">
                {user?.name || 'Admin Superuser'}
              </span>
              <span className="text-[10px] text-indigo-500 dark:text-indigo-400 font-semibold uppercase">
                ADMIN COMMAND
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-2 z-50 animate-fade-in text-slate-900 dark:text-slate-100">
              <div className="p-3 border-b border-slate-100 dark:border-slate-800">
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100">{user?.name || 'Admin Superuser'}</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user?.email || 'admin@retailmind.ai'}</div>
                <div className="mt-1 text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 inline-block font-bold">
                  ADMIN • HQ COMMAND
                </div>
              </div>

              <div className="py-1 space-y-0.5">
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
