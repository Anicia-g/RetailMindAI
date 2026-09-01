'use client';

import React from 'react';
import {
  Award,
  TrendingUp,
  Star,
  ShoppingBag,
  RotateCcw,
  CheckCircle2,
  Calendar,
  Zap,
  Target,
  Flame,
  Clock,
  Sparkles,
  Users,
  DollarSign,
  Package,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { initialEmployees } from '@/data/employees';
import { initialProducts } from '@/data/products';
import { initialCustomers } from '@/data/customers';
import { StatCard } from '@/components/common/StatCard';
import { Badge } from '@/components/common/Badge';

export default function SellerPerformancePage() {
  const { user } = useAuth();
  const currentSeller =
    initialEmployees.find((e) => e.email === user?.email) || initialEmployees[0];

  const topCustomersServed = initialCustomers.slice(0, 3);
  const bestProduct = initialProducts[0];

  const badges = [
    { title: 'Top Seller of the Week', desc: 'Achieved 124% quota in dairy & grocery', icon: Award, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/40' },
    { title: 'Fast Checkout Champ', desc: 'Average checkout duration 1.4 minutes', icon: Zap, color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/40' },
    { title: 'Customer Favorite', desc: '4.9 Star CSAT rating across 148+ surveys', icon: Star, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40' },
    { title: 'Zero Spoilage Advocate', desc: 'Clearance discount movement rate of 94%', icon: CheckCircle2, color: 'text-teal-500 bg-teal-50 dark:bg-teal-950/40' },
  ];

  return (
    <div className="space-y-7 pb-16">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950 via-slate-900 to-purple-950 text-white shadow-xl border border-purple-900/40 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={currentSeller.avatar || user?.image}
            alt={currentSeller.name}
            className="w-20 h-20 rounded-2xl object-cover border-2 border-purple-400 shadow-md"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded bg-purple-500/30 border border-purple-400/30 text-purple-300">
                Rank #{currentSeller.rank} in Store
              </span>
              <span className="text-xs text-slate-300">Store: {user?.store || currentSeller.store}</span>
            </div>
            <h2 className="text-2xl font-black mt-1">{user?.name || currentSeller.name}</h2>
            <p className="text-xs text-purple-200/80 mt-0.5">
              Category Lead: <strong>{currentSeller.topCategory}</strong> • Active Status: <strong>On Active Shift</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl backdrop-blur-xs border border-white/10">
          <div>
            <div className="text-[10px] text-purple-200 uppercase font-bold">Overall Performance</div>
            <div className="text-2xl font-black text-emerald-400">{currentSeller.performanceScore}%</div>
            <div className="text-[11px] text-slate-300">Store Benchmark: 85%</div>
          </div>
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-300 font-black">
            A+
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Monthly Target Quota"
          value={`${currentSeller.targetAchievement}%`}
          change="+24% over quota"
          isPositive={true}
          subtitle="₹3,10,000 / ₹2,50,000"
          icon={Target}
        />
        <StatCard
          title="Orders Handled"
          value={`${currentSeller.ordersHandled || 342}`}
          change="4.2 / hour"
          isPositive={true}
          subtitle="this month total"
          icon={ShoppingBag}
        />
        <StatCard
          title="Customer CSAT Rating"
          value={`⭐ ${currentSeller.rating}`}
          change="98% positive"
          isPositive={true}
          subtitle="from 148 verified ratings"
          icon={Star}
        />
        <StatCard
          title="Return & Refund Rate"
          value={currentSeller.returnRate || '1.2%'}
          change="Low (Healthy)"
          isPositive={true}
          subtitle="store benchmark 2.5%"
          icon={RotateCcw}
        />
      </div>

      {/* Top Customers Served & Best Selling Product Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Customers Served */}
        <div className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-600" />
              Top Customers Served by You
            </h3>
            <Badge variant="purple" size="sm">Store VIPs</Badge>
          </div>

          <div className="space-y-3 divide-y divide-slate-100 dark:divide-slate-800">
            {topCustomersServed.map((cust) => (
              <div key={cust.id} className="pt-3 first:pt-0 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <img src={cust.avatar} alt={cust.name} className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700" />
                  <div>
                    <h5 className="font-bold text-slate-900 dark:text-slate-100">{cust.name}</h5>
                    <span className="text-[11px] text-slate-400">{cust.orders} orders handled</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-black text-slate-900 dark:text-slate-100">₹{cust.totalSpent.toLocaleString()}</span>
                  <span className="text-[10px] text-emerald-600 block font-semibold">{cust.segment}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Best Selling Product Managed */}
        <div className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-500" />
              Top Product Velocity Managed
            </h3>
            <Badge variant="success" size="sm">High Revenue</Badge>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center gap-4">
            <img src={bestProduct.image} alt={bestProduct.name} className="w-16 h-16 rounded-2xl object-cover border border-slate-200 dark:border-slate-700" />
            <div className="min-w-0 flex-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">{bestProduct.category}</span>
              <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">{bestProduct.name}</h4>
              <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                <span>Units: <strong className="text-slate-900 dark:text-slate-100">{bestProduct.unitsSold}</strong></span>
                <span>•</span>
                <span>Revenue: <strong className="text-purple-600">₹{bestProduct.revenue.toLocaleString()}</strong></span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] text-slate-400 block uppercase">Average Order Value</span>
              <span className="text-base font-black text-slate-900 dark:text-slate-100">₹1,433 AOV</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] text-slate-400 block uppercase">Conversion Rate</span>
              <span className="text-base font-black text-emerald-600">68.4%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Badges and Shift Breakdown */}
      <div className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Award className="w-4 h-4 text-purple-600" />
            Earned Badges & Performance Milestones
          </h3>
          <Badge variant="purple" size="sm">4 Active Badges</Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {badges.map((b, idx) => {
            const Icon = b.icon;
            return (
              <div
                key={idx}
                className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-start gap-3"
              >
                <div className={`p-2.5 rounded-xl ${b.color} flex-shrink-0`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100">{b.title}</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{b.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
