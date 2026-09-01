'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Boxes,
  Users,
  TrendingUp,
  Award,
  FileSpreadsheet,
  User,
  Store,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Flame,
  Zap,
  Settings,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useAppSettings } from '@/context/AppSettingsContext';

export function SellerSidebar({ isCollapsed, onToggleCollapse, isMobileOpen, onCloseMobile }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const { t } = useAppSettings();

  const navigationItems = [
    {
      groupKey: 'coreOperations',
      items: [
        { labelKey: 'dashboard', href: '/seller', icon: LayoutDashboard },
        { labelKey: 'sellerSales', href: '/seller/sales', icon: ShoppingCart, badge: 'Shift POS', badgeColor: 'bg-purple-500 text-white' },
        { labelKey: 'products', href: '/seller/products', icon: Package },
        { labelKey: 'sellerInventory', href: '/seller/inventory', icon: Boxes, badge: '3 Low', badgeColor: 'bg-rose-500 text-white' },
        { labelKey: 'sellerCustomers', href: '/seller/customers', icon: Users },
      ],
    },
    {
      groupKey: 'performanceAndReports',
      items: [
        { labelKey: 'sellerPerformance', href: '/seller/performance', icon: Award, badge: '⭐ 124%', badgeColor: 'bg-amber-500 text-white' },
        { labelKey: 'sellerBestSellers', href: '/seller/best-sellers', icon: Flame },
        { labelKey: 'sellerReports', href: '/seller/reports', icon: FileSpreadsheet },
        { labelKey: 'sellerProfile', href: '/seller/profile', icon: User },
      ],
    },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col transition-all duration-300 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 select-none ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800">
          <Link href="/seller" className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-500/20 flex-shrink-0">
              <Store className="w-5 h-5" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-1">
                  RetailMind <span className="text-purple-600 dark:text-purple-400">SELLER</span>
                </span>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold truncate">
                  {user?.store ? user.store.split('(')[0] : 'Store Terminal'}
                </span>
              </div>
            )}
          </Link>

          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {navigationItems.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              {!isCollapsed && (
                <div className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {t(group.groupKey)}
                </div>
              )}
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== '/seller' && pathname?.startsWith(`${item.href}/`));
                const itemLabel = t(item.labelKey);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => {
                      if (onCloseMobile) onCloseMobile();
                    }}
                    title={isCollapsed ? itemLabel : undefined}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all group ${
                      isActive
                        ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/20 font-semibold dark:bg-purple-600'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon
                        className={`w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110 ${
                          isActive
                            ? 'text-white'
                            : 'text-slate-400 group-hover:text-purple-600 dark:group-hover:text-purple-400'
                        }`}
                      />
                      {!isCollapsed && (
                        <span className="truncate">{itemLabel}</span>
                      )}
                    </div>

                    {!isCollapsed && item.badge && (
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : item.badgeColor || 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        {/* Bottom Shift Status Pill */}
        {!isCollapsed && (
          <div className="p-3 m-3 rounded-xl bg-purple-50/70 dark:bg-slate-800/80 border border-purple-100 dark:border-slate-700/60 text-xs">
            <div className="flex items-center justify-between font-bold text-purple-700 dark:text-purple-300">
              <span className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                Active Shift: 10:00 - 18:00
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Store: {user?.store || 'Indiranagar Flagship'}
            </p>
          </div>
        )}
      </aside>
    </>
  );
}
