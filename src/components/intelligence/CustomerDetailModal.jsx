'use client';

import React from 'react';
import {
  User,
  ShoppingBag,
  Sparkles,
  Phone,
  Mail,
  Calendar,
  Store,
  CreditCard,
  CheckCircle2,
  Award,
  AlertTriangle,
} from 'lucide-react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';

export function CustomerDetailModal({
  customer,
  isOpen,
  onClose,
}) {
  if (!customer) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${customer.name} — Customer Intelligence`}
      subtitle={`Customer ID: ${customer.id} | Store: ${customer.preferredStore || 'Indiranagar Flagship'}`}
      maxWidth="max-w-3xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <span className="text-xs text-slate-400">
            K-Means Segment: <strong>{customer.cluster || 'Cluster 1: High Value Champions'}</strong>
          </span>
          <Button variant="primary" size="sm" onClick={onClose}>
            Close Profile
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Customer Header Card */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <img
              src={customer.avatar}
              alt={customer.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-purple-400 flex-shrink-0 shadow-sm"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-base text-slate-900 dark:text-slate-100">{customer.name}</span>
                <Badge
                  variant={
                    customer.segment === 'VIP'
                      ? 'purple'
                      : customer.segment === 'At Risk'
                      ? 'danger'
                      : customer.segment === 'Loyal'
                      ? 'success'
                      : 'info'
                  }
                  size="sm"
                >
                  {customer.segment || 'VIP'}
                </Badge>
              </div>
              <div className="text-xs text-slate-500 mt-1 flex items-center gap-3 flex-wrap">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" /> {customer.email}
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" /> {customer.phone}
                </span>
              </div>
            </div>
          </div>

          <div className="text-right flex-shrink-0">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Lifetime Value</span>
            <div className="text-xl font-black text-slate-900 dark:text-slate-100">
              ₹{customer.totalSpent?.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-400">{customer.orders} Completed Orders</div>
          </div>
        </div>

        {/* RFM Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <span className="text-slate-400 font-bold uppercase text-[10px] block">Recency (R)</span>
            <div className="text-base font-black text-slate-900 dark:text-slate-100 mt-0.5">
              {customer.lastPurchase || `${customer.recencyDays}d ago`}
            </div>
            <span className="text-[10px] text-slate-400">{customer.recencyDays} days since order</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <span className="text-slate-400 font-bold uppercase text-[10px] block">Frequency (F)</span>
            <div className="text-base font-black text-slate-900 dark:text-slate-100 mt-0.5">
              {customer.orders} Orders
            </div>
            <span className="text-[10px] text-slate-400">High purchase frequency</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <span className="text-slate-400 font-bold uppercase text-[10px] block">Monetary Value (M)</span>
            <div className="text-base font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
              ₹{customer.totalSpent?.toLocaleString()}
            </div>
            <span className="text-[10px] text-slate-400">Gross revenue generated</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <span className="text-slate-400 font-bold uppercase text-[10px] block">Avg Order Value (AOV)</span>
            <div className="text-base font-black text-slate-900 dark:text-slate-100 mt-0.5">
              ₹{customer.aov?.toLocaleString() || 3400}
            </div>
            <span className="text-[10px] text-slate-400">Per basket checkout</span>
          </div>
        </div>

        {/* AI Recommendation Banner */}
        <div className="p-4 rounded-2xl bg-purple-50/80 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/60 space-y-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <h4 className="text-xs font-black uppercase tracking-wider text-purple-900 dark:text-purple-200">
              Customer Intelligence Diagnostic
            </h4>
          </div>
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
            {customer.aiInsight}
          </p>
          {customer.recommendedAction && (
            <div className="p-2.5 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-purple-100 dark:border-purple-900/40 text-xs">
              <span className="font-bold text-purple-700 dark:text-purple-300">Action Recommended: </span>
              <span className="text-slate-700 dark:text-slate-300">{customer.recommendedAction}</span>
            </div>
          )}
        </div>

        {/* Recent Purchase History */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Recent Store Order History
          </h4>

          {customer.recentPurchases && customer.recentPurchases.length > 0 ? (
            <div className="space-y-2">
              {customer.recentPurchases.map((rec) => (
                <div
                  key={rec.id}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs gap-3"
                >
                  <div>
                    <div className="font-mono font-bold text-purple-600 dark:text-purple-400">{rec.id}</div>
                    <div className="text-slate-900 dark:text-slate-100 font-semibold mt-0.5">{rec.items}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="font-black text-sm text-slate-900 dark:text-slate-100">₹{rec.total}</div>
                    <div className="text-[10px] text-slate-400">{rec.date} • {rec.payment}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">No recent transactions recorded.</p>
          )}
        </div>
      </div>
    </Modal>
  );
}
