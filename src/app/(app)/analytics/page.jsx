'use client';

import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  IndianRupee,
  ShoppingBag,
  Package,
  Users,
  Store,
  Layers,
  ArrowUpRight,
  Filter
} from 'lucide-react';
import { useAppSettings } from '@/context/AppSettingsContext';
import { StatCard } from '@/components/common/StatCard';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { SalesChart } from '@/components/charts/SalesChart';
import { CategoryChart } from '@/components/charts/CategoryChart';
import { initialAnalytics } from '@/data/analytics';

export default function AnalyticsPage() {
  const { t } = useAppSettings();
  const [timeRange, setTimeRange] = useState('YTD');

  const { kpis, storePerformance, paymentMethodDistribution } = initialAnalytics;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-slate-100">{t('analytics')}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Executive revenue analytics, margin contributions, category mix, and multi-store benchmarks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {['30D', '90D', 'YTD', '12M'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                timeRange === range
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t('totalSales')}
          value="₹12.4 Lakhs"
          change={kpis.revenueGrowth}
          isPositive={true}
          icon={IndianRupee}
        />
        <StatCard
          title="Gross Margin"
          value={`${kpis.grossMarginPercent}%`}
          change="+2.4% Margin"
          isPositive={true}
          icon={TrendingUp}
        />
        <StatCard
          title={t('totalOrders')}
          value={kpis.totalOrders.toLocaleString()}
          change={kpis.orderGrowth}
          isPositive={true}
          icon={ShoppingBag}
        />
        <StatCard
          title="Active Customer Base"
          value={kpis.activeCustomersCount}
          change="+18% YoY"
          isPositive={true}
          icon={Users}
        />
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Performance (2 Cols) */}
        <div className="lg:col-span-2 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{t('revenueTrend')}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Actual Revenue vs AI Predictive Targets</p>
            </div>
            <Badge variant="purple" size="sm">
              +14.2% Above Target
            </Badge>
          </div>
          <SalesChart height={240} />
        </div>

        {/* Category Contribution (1 Col) */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{t('salesByCategory')}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Revenue share & Margin</p>
            </div>
          </div>
          <CategoryChart />
        </div>
      </div>

      {/* Bottom Row: Store Benchmarks & Payment Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Store Performance */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{t('storePerformance')}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Monthly target attainment</p>
            </div>
          </div>

          <div className="space-y-3">
            {storePerformance.map((st, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-xs text-slate-900 dark:text-slate-100">{st.store}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Revenue: ₹{(st.revenue / 100000).toFixed(1)}L / Target ₹{(st.target / 100000).toFixed(1)}L
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-extrabold text-sm text-slate-900 dark:text-slate-100">{st.completion}</div>
                  <Badge
                    variant={st.health.includes('Critical') ? 'danger' : st.health.includes('Low') ? 'warning' : 'success'}
                    size="sm"
                  >
                    {st.health}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Channels */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Payment Channel Breakdown</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Settlement volume distribution</p>
            </div>
          </div>

          <div className="space-y-3">
            {paymentMethodDistribution.map((pm, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 dark:text-slate-200">{pm.method}</span>
                  <span className="text-slate-500">₹{(pm.amount / 100000).toFixed(1)}L ({pm.percentage}%)</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-indigo-600 dark:bg-indigo-500 transition-all duration-500"
                    style={{ width: `${pm.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
