'use client';

import React, { useState, useMemo } from 'react';
import {
  ShoppingBag,
  IndianRupee,
  Calendar,
  CreditCard,
  Search,
  Eye,
  FileText,
  Printer,
  CheckCircle2,
  TrendingUp
} from 'lucide-react';
import { useAppSettings } from '@/context/AppSettingsContext';
import { StatCard } from '@/components/common/StatCard';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { Table } from '@/components/common/Table';
import { Pagination } from '@/components/common/Pagination';
import { Badge } from '@/components/common/Badge';
import { Modal } from '@/components/common/Modal';
import { SalesChart } from '@/components/charts/SalesChart';
import { initialSales } from '@/data/sales';
import { initialAnalytics } from '@/data/analytics';

export default function SalesPage() {
  const { t } = useAppSettings();

  const [salesList, setSalesList] = useState(initialSales);
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Order Details Modal
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [activeOrder, setActiveOrder] = useState(null);

  const filteredSales = useMemo(() => {
    return salesList.filter((sale) => {
      const matchesSearch =
        sale.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.store.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesPayment = paymentFilter === 'All' || sale.paymentMethod.includes(paymentFilter);
      const matchesStatus = statusFilter === 'All' || sale.status === statusFilter;

      return matchesSearch && matchesPayment && matchesStatus;
    });
  }, [salesList, searchTerm, paymentFilter, statusFilter]);

  const totalPages = Math.ceil(filteredSales.length / itemsPerPage) || 1;
  const paginatedSales = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredSales.slice(start, start + itemsPerPage);
  }, [filteredSales, currentPage]);

  const handleOpenDetail = (order) => {
    setActiveOrder(order);
    setIsDetailModalOpen(true);
  };

  const columns = [
    {
      header: t('orderId'),
      accessor: 'id',
      render: (row) => (
        <div className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
          #{row.id}
        </div>
      ),
    },
    {
      header: t('customer'),
      accessor: 'customerName',
      render: (row) => (
        <div className="flex items-center gap-2.5">
          {row.avatar && (
            <img
              src={row.avatar}
              alt={row.customerName}
              className="w-7 h-7 rounded-full object-cover border border-slate-200 dark:border-slate-700 flex-shrink-0"
            />
          )}
          <div className="min-w-0">
            <div className="font-bold text-slate-900 dark:text-slate-100 truncate">{row.customerName}</div>
            <div className="text-[11px] text-slate-400 truncate">{row.store}</div>
          </div>
        </div>
      ),
    },
    {
      header: t('date'),
      accessor: 'date',
      render: (row) => <span className="text-xs text-slate-500">{row.date}</span>,
    },
    {
      header: t('paymentMethod'),
      accessor: 'paymentMethod',
      render: (row) => <span className="text-xs font-medium">{row.paymentMethod}</span>,
    },
    {
      header: t('amount'),
      accessor: 'totalAmount',
      render: (row) => (
        <div className="font-extrabold text-slate-900 dark:text-slate-100">
          ₹{row.totalAmount.toLocaleString()}
        </div>
      ),
    },
    {
      header: t('status'),
      accessor: 'status',
      render: (row) => (
        <Badge variant={row.status === 'Completed' ? 'success' : 'warning'} size="sm" dot>
          {row.status}
        </Badge>
      ),
    },
    {
      header: t('actions'),
      accessor: 'actions',
      align: 'right',
      render: (row) => (
        <Button
          variant="outline"
          size="sm"
          icon={Eye}
          onClick={() => handleOpenDetail(row)}
        >
          {t('view')}
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-slate-100">{t('salesManagement')}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time transactional audit, omnichannel revenue recognition, and tax invoicing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="md"
            icon={Printer}
            onClick={() => window.print()}
          >
            {t('print')}
          </Button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title={t('totalSales')}
          value="₹12.4L"
          change="+14.2%"
          isPositive={true}
          subtitle="this month total"
          icon={IndianRupee}
        />
        <StatCard
          title={t('totalOrders')}
          value="2,450"
          change="+8.6%"
          isPositive={true}
          subtitle="gross orders"
          icon={ShoppingBag}
        />
        <StatCard
          title={t('avgOrderValue')}
          value="₹506"
          change="+5.1%"
          isPositive={true}
          subtitle="basket density"
          icon={TrendingUp}
        />
      </div>

      {/* Revenue Trend Chart */}
      <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{t('revenueTrend')}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Monthly revenue vs Target forecast</p>
          </div>
        </div>
        <SalesChart height={220} />
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="w-full md:w-80">
          <Input
            placeholder="Search order ID, customer name, store..."
            icon={Search}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <Select
            value={paymentFilter}
            onChange={(e) => {
              setPaymentFilter(e.target.value);
              setCurrentPage(1);
            }}
            options={[
              { value: 'All', label: 'All Payment Methods' },
              { value: 'UPI', label: 'UPI & Instant QR' },
              { value: 'Card', label: 'Credit / Debit Cards' },
              { value: 'Transfer', label: 'Bank Transfer' },
            ]}
            className="w-48"
          />

          <Select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            options={[
              { value: 'All', label: 'All Statuses' },
              { value: 'Completed', label: 'Completed' },
              { value: 'Pending', label: 'Pending' },
            ]}
            className="w-40"
          />
        </div>
      </div>

      {/* Sales Table */}
      <Table
        columns={columns}
        data={paginatedSales}
        emptyMessage={t('noDataMatchingFilter')}
      />

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredSales.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
      />

      {/* Invoice Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={`Invoice / Order #${activeOrder?.id}`}
        subtitle={`Fulfilled at ${activeOrder?.store} • ${activeOrder?.date}`}
        footer={
          <div className="flex items-center justify-between w-full">
            <Button variant="outline" size="sm" icon={Printer} onClick={() => window.print()}>
              Print Receipt
            </Button>
            <Button variant="primary" size="sm" onClick={() => setIsDetailModalOpen(false)}>
              Close
            </Button>
          </div>
        }
      >
        {activeOrder && (
          <div className="space-y-4 text-slate-800 dark:text-slate-200">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex justify-between items-center text-xs">
              <div>
                <span className="text-slate-400 block">Customer</span>
                <span className="font-bold text-sm text-slate-900 dark:text-slate-100">{activeOrder.customerName}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Payment Method</span>
                <span className="font-bold text-sm text-slate-900 dark:text-slate-100">{activeOrder.paymentMethod}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Status</span>
                <Badge variant="success" size="sm">{activeOrder.status}</Badge>
              </div>
            </div>

            {/* Line items */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 text-[11px] font-bold uppercase tracking-wider text-slate-500 flex justify-between">
                <span>Product Item</span>
                <span className="w-20 text-center">Qty</span>
                <span className="w-24 text-right">Price</span>
                <span className="w-24 text-right">Subtotal</span>
              </div>
              {activeOrder.items?.map((it, idx) => (
                <div key={idx} className="p-3 flex items-center justify-between text-xs font-medium">
                  <div className="flex-1">
                    <div className="font-bold">{it.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{it.sku}</div>
                  </div>
                  <div className="w-20 text-center">{it.qty}</div>
                  <div className="w-24 text-right text-slate-500">₹{it.price.toLocaleString()}</div>
                  <div className="w-24 text-right font-bold text-slate-900 dark:text-slate-100">
                    ₹{(it.qty * it.price).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <div className="w-64 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal:</span>
                  <span>₹{Math.round(activeOrder.totalAmount * 0.82).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>GST (18%):</span>
                  <span>₹{Math.round(activeOrder.totalAmount * 0.18).toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-black text-sm text-slate-900 dark:text-slate-100 pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span>Total Paid:</span>
                  <span className="text-indigo-600 dark:text-indigo-400">₹{activeOrder.totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
