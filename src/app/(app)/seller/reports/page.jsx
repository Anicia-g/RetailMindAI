'use client';

import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  Calendar,
  CreditCard,
  Banknote,
  QrCode,
  TrendingUp,
  Receipt,
  CheckCircle2,
  Printer,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';

export default function SellerReportsPage() {
  const { user } = useAuth();
  const [downloaded, setDownloaded] = useState(false);

  const handleExport = () => {
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 3000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-purple-600" />
            Shift Closing & Reconciliation Reports
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Daily settlement report, cash-drawer audit, and payment breakdowns.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={Printer}
            onClick={() => window.print()}
          >
            Print Shift Sheet
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={Download}
            onClick={handleExport}
            className="bg-purple-600 hover:bg-purple-700 font-bold"
          >
            {downloaded ? 'Report Exported!' : 'Export Shift Report'}
          </Button>
        </div>
      </div>

      {/* Daily Shift Closing Report Card */}
      <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-2">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Shift Closing Summary</span>
            <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">
              Shift ID: SHF-2026-0828 • Indiranagar Flagship
            </h3>
          </div>
          <Badge variant="success" size="md" dot>
            Shift Verified & Balanced
          </Badge>
        </div>

        {/* Breakdown Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/40 space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-purple-700 dark:text-purple-300">
              <QrCode className="w-4 h-4" /> UPI Settlements
            </div>
            <div className="text-2xl font-black text-purple-950 dark:text-purple-100">₹24,500</div>
            <p className="text-[10px] text-slate-500">32 Transactions • 100% Reconciled</p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/40 space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-300">
              <Banknote className="w-4 h-4" /> Cash Drawer Audit
            </div>
            <div className="text-2xl font-black text-emerald-950 dark:text-emerald-100">₹5,480</div>
            <p className="text-[10px] text-slate-500">12 Transactions • Exact Match</p>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 dark:text-indigo-300">
              <CreditCard className="w-4 h-4" /> Card POS Swipes
            </div>
            <div className="text-2xl font-black text-indigo-950 dark:text-indigo-100">₹2,500</div>
            <p className="text-[10px] text-slate-500">4 Transactions • Batch Closed</p>
          </div>
        </div>

        {/* Category Contribution */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Category Contribution to Shift Revenue
          </h4>
          <div className="space-y-2">
            {[
              { cat: 'Dairy & Eggs', sales: '₹14,200', pct: 44, color: 'bg-blue-500' },
              { cat: 'Bakery & Snacks', sales: '₹9,450', pct: 29, color: 'bg-amber-500' },
              { cat: 'Fresh Produce', sales: '₹5,630', pct: 17, color: 'bg-emerald-500' },
              { cat: 'Beverages', sales: '₹3,200', pct: 10, color: 'bg-purple-500' },
            ].map((c) => (
              <div key={c.cat} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span>{c.cat}</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">{c.sales} ({c.pct}%)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div className={`h-full ${c.color}`} style={{ width: `${c.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
