'use client';

import React from 'react';
import { Award, Repeat, IndianRupee, AlertTriangle, Sparkles, ArrowRight, Eye, User } from 'lucide-react';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';

export function BestCustomerCard({ analytics, onViewCustomer }) {
  if (!analytics) return null;

  const { topCustomer, mostFrequent, highestSpending, recentHighValue, atRiskCustomer } = analytics;

  const spotlightList = [
    {
      title: '🏆 Top Customer',
      customer: topCustomer,
      highlight: `₹${topCustomer?.totalSpent?.toLocaleString()} total spending`,
      subText: `${topCustomer?.orders} orders • ₹${topCustomer?.aov?.toLocaleString()} AOV`,
      badge: 'VIP CUSTOMER',
      badgeVariant: 'purple',
      icon: Award,
      color: 'bg-amber-500/10 text-amber-500 border-amber-400/30',
    },
    {
      title: '🔁 Most Frequent',
      customer: mostFrequent,
      highlight: `${mostFrequent?.orders} completed orders`,
      subText: `₹${mostFrequent?.totalSpent?.toLocaleString()} lifetime spend • ${mostFrequent?.lastPurchase}`,
      badge: 'LOYAL REGULAR',
      badgeVariant: 'success',
      icon: Repeat,
      color: 'bg-emerald-500/10 text-emerald-500 border-emerald-400/30',
    },
    {
      title: '💰 Highest Spending',
      customer: highestSpending,
      highlight: `₹${highestSpending?.totalSpent?.toLocaleString()} total spending`,
      subText: `${highestSpending?.orders} orders • ₹${highestSpending?.aov?.toLocaleString()} AOV`,
      badge: 'HIGH VALUE',
      badgeVariant: 'purple',
      icon: IndianRupee,
      color: 'bg-indigo-500/10 text-indigo-500 border-indigo-400/30',
    },
    {
      title: '⚠️ Valuable Customer At Risk',
      customer: atRiskCustomer,
      highlight: `Previously ₹${atRiskCustomer?.totalSpent?.toLocaleString()} spent`,
      subText: `No purchase in ${atRiskCustomer?.recencyDays || 45} days • Needs re-engagement`,
      badge: 'AT RISK (CHURN)',
      badgeVariant: 'danger',
      icon: AlertTriangle,
      color: 'bg-rose-500/10 text-rose-500 border-rose-400/30',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-500 border border-amber-200 dark:border-amber-900/50">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
              🏆 Best Store Customers (RFM & LTV Intelligence)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              High-value champions, frequent shoppers, and VIP accounts requiring engagement
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {spotlightList.map((item, idx) => {
          const Icon = item.icon;
          const cust = item.customer;
          if (!cust) return null;

          return (
            <div
              key={idx}
              className="p-4 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between space-y-3 hover:border-purple-300 dark:hover:border-purple-800 transition-all group"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    {item.title}
                  </span>
                  <Badge variant={item.badgeVariant} size="sm">
                    {item.badge}
                  </Badge>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <img
                    src={cust.avatar}
                    alt={cust.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-slate-200 dark:border-slate-700 flex-shrink-0 group-hover:border-purple-400 transition-colors"
                  />
                  <div className="min-w-0">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">
                      {cust.name}
                    </h4>
                    <p className="text-xs font-black text-purple-600 dark:text-purple-400 truncate">
                      {item.highlight}
                    </p>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  {item.subText}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => onViewCustomer(cust)}
                  className="w-full py-1.5 px-3 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/80 hover:bg-purple-50 hover:text-purple-700 dark:hover:bg-purple-950/60 dark:hover:text-purple-300 border border-slate-200 dark:border-slate-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Customer Details</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
