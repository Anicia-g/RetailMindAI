'use client';

import React, { useState, useEffect } from 'react';
import {
  ShoppingCart,
  Plus,
  Search,
  Filter,
  CreditCard,
  Banknote,
  QrCode,
  Calendar,
  CheckCircle2,
  TrendingUp,
  Receipt,
  Download,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useAppSettings } from '@/context/AppSettingsContext';
import { initialSales } from '@/data/sales';
import { Button } from '@/components/common/Button';
import { Table } from '@/components/common/Table';
import { Badge } from '@/components/common/Badge';
import { StatCard } from '@/components/common/StatCard';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';

export default function SellerSalesPage() {
  const { user } = useAuth();
  const { t } = useAppSettings();
  const [sales, setSales] = useState(initialSales);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPayment, setSelectedPayment] = useState('All');

  useEffect(() => {
    const handleSaleRecorded = (e) => {
      if (e.detail) {
        setSales((prev) => [e.detail, ...prev]);
      }
    };
    window.addEventListener('seller-sale-recorded', handleSaleRecorded);
    return () => window.removeEventListener('seller-sale-recorded', handleSaleRecorded);
  }, []);

  const filteredSales = sales.filter((s) => {
    const matchesSearch =
      (s.id && s.id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (s.customerName && s.customerName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesPayment = selectedPayment === 'All' || s.paymentMethod?.includes(selectedPayment);
    return matchesSearch && matchesPayment;
  });

  const totalShiftRevenue = sales.reduce((acc, s) => acc + (s.totalAmount || 0), 0);
  const totalOrdersCount = sales.length;
  const avgBasketSize = Math.round(totalShiftRevenue / (totalOrdersCount || 1));

  const handleOpenRecordSale = () => {
    window.dispatchEvent(new CustomEvent('open-record-sale-modal'));
  };

  const columns = [
    {
      header: 'Receipt ID',
      accessor: 'id',
      render: (row) => <span className="font-mono font-bold text-purple-600 dark:text-purple-400 text-xs">{row.id}</span>,
    },
    {
      header: t('customer'),
      accessor: 'customerName',
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold text-[10px] flex items-center justify-center">
            {row.customerName?.slice(0, 2).toUpperCase() || 'WI'}
          </div>
          <div>
            <div className="font-bold text-xs text-slate-900 dark:text-slate-100">{row.customerName}</div>
            <div className="text-[10px] text-slate-400">{row.store?.split('(')[0] || 'Store 01'}</div>
          </div>
        </div>
      ),
    },
    {
      header: t('items'),
      accessor: 'itemsCount',
      render: (row) => <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{row.itemsCount || row.items?.length || 1} {t('items').toLowerCase()}</span>,
    },
    {
      header: t('paymentMethod'),
      accessor: 'paymentMethod',
      render: (row) => (
        <Badge variant={row.paymentMethod?.includes('UPI') ? 'purple' : row.paymentMethod?.includes('Card') ? 'info' : 'success'} size="sm">
          {row.paymentMethod || 'UPI'}
        </Badge>
      ),
    },
    {
      header: t('date'),
      accessor: 'date',
      render: (row) => <span className="text-xs text-slate-500">{row.date}</span>,
    },
    {
      header: t('amount'),
      accessor: 'totalAmount',
      align: 'right',
      render: (row) => (
        <span className="font-black text-sm text-slate-900 dark:text-slate-100">
          ₹{row.totalAmount?.toLocaleString()}
        </span>
      ),
    },
    {
      header: t('status'),
      accessor: 'status',
      align: 'right',
      render: (row) => (
        <Badge variant="success" size="sm" dot>
          {row.status || t('completed')}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header & New POS Sale Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-slate-100">{t('shiftSalesPOS')}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Log walk-in customer sales, process payments, and track shift revenue.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={Plus}
          onClick={handleOpenRecordSale}
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-md shadow-purple-600/30 cursor-pointer"
        >
          {t('recordSale')}
        </Button>
      </div>

      {/* KPI Shift Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title={t('shiftRevenue')}
          value={`₹${totalShiftRevenue.toLocaleString()}`}
          change="+18% vs Target"
          isPositive={true}
          icon={TrendingUp}
        />
        <StatCard
          title={t('totalOrders')}
          value={String(totalOrdersCount)}
          change="Shift Quota 80%"
          isPositive={true}
          icon={Receipt}
        />
        <StatCard
          title={t('avgOrderValue')}
          value={`₹${avgBasketSize.toLocaleString()}`}
          change="Basket Density"
          isPositive={true}
          icon={ShoppingCart}
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="w-full sm:w-80">
          <Input
            placeholder="Search receipt ID or customer name..."
            icon={Search}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select
            value={selectedPayment}
            onChange={(e) => setSelectedPayment(e.target.value)}
            options={[
              { value: 'All', label: 'All Payment Methods' },
              { value: 'UPI', label: 'UPI / QR Code' },
              { value: 'Card', label: 'Credit / Debit Card' },
              { value: 'Cash', label: 'Cash Payment' },
            ]}
            className="w-48"
          />
        </div>
      </div>

      {/* Sales Table */}
      <Table
        columns={columns}
        data={filteredSales}
        emptyMessage="No sales transactions recorded yet for this shift."
      />
    </div>
  );
}
