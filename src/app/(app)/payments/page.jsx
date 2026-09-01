'use client';

import React, { useState, useMemo } from 'react';
import {
  CreditCard,
  Search,
  Eye,
  IndianRupee,
  CheckCircle2,
  Lock,
  ArrowUpRight,
  Printer
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
import { initialPayments } from '@/data/payments';

export default function PaymentsPage() {
  const { t } = useAppSettings();

  const [paymentList, setPaymentList] = useState(initialPayments);
  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [activePayment, setActivePayment] = useState(null);

  const filteredPayments = useMemo(() => {
    return paymentList.filter((pay) => {
      const matchSearch =
        pay.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pay.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pay.customerName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchMethod = methodFilter === 'All' || pay.method.includes(methodFilter);

      return matchSearch && matchMethod;
    });
  }, [paymentList, searchTerm, methodFilter]);

  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage) || 1;
  const paginatedPayments = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredPayments.slice(start, start + itemsPerPage);
  }, [filteredPayments, currentPage]);

  const handleOpenDetail = (pay) => {
    setActivePayment(pay);
    setIsDetailModalOpen(true);
  };

  const columns = [
    {
      header: t('transactionId'),
      accessor: 'id',
      render: (row) => (
        <div className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
          {row.id}
        </div>
      ),
    },
    {
      header: t('orderId'),
      accessor: 'orderId',
      render: (row) => <span className="font-mono text-xs text-slate-500">#{row.orderId}</span>,
    },
    {
      header: t('customer'),
      accessor: 'customerName',
      render: (row) => <span className="font-bold text-xs text-slate-900 dark:text-slate-100">{row.customerName}</span>,
    },
    {
      header: t('paymentMethod'),
      accessor: 'method',
      render: (row) => <span className="text-xs font-semibold">{row.method}</span>,
    },
    {
      header: t('amount'),
      accessor: 'amount',
      render: (row) => (
        <span className="font-extrabold text-xs text-slate-900 dark:text-slate-100">
          ₹{row.amount.toLocaleString()}
        </span>
      ),
    },
    {
      header: t('date'),
      accessor: 'date',
      render: (row) => <span className="text-xs text-slate-500">{row.date}</span>,
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
          {t('details')}
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-slate-100">{t('paymentsManagement')}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Payment gateway reconciliation, digital settlement logs, and transaction audit trails.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="md" icon={Printer} onClick={() => window.print()}>
            {t('export')}
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Processed (30d)"
          value="₹12,40,583"
          change="+14.2%"
          isPositive={true}
          icon={IndianRupee}
        />
        <StatCard
          title="Payment Success Rate"
          value="99.4%"
          change="0.6% Drop"
          isPositive={true}
          icon={CheckCircle2}
        />
        <StatCard
          title="Top Payment Channel"
          value="UPI & Instant QR"
          change="48% Volume"
          isPositive={null}
          icon={CreditCard}
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="w-full md:w-80">
          <Input
            placeholder="Search transaction ID, order, customer..."
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
            value={methodFilter}
            onChange={(e) => {
              setMethodFilter(e.target.value);
              setCurrentPage(1);
            }}
            options={[
              { value: 'All', label: 'All Payment Channels' },
              { value: 'UPI', label: 'UPI' },
              { value: 'Card', label: 'Card' },
              { value: 'Transfer', label: 'Bank Transfer' },
            ]}
            className="w-48"
          />
        </div>
      </div>

      {/* Payments Table */}
      <Table
        columns={columns}
        data={paginatedPayments}
        emptyMessage={t('noDataMatchingFilter')}
      />

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredPayments.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
      />

      {/* Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={`Payment Audit: ${activePayment?.id}`}
        subtitle={`Gateway: ${activePayment?.gateway} • ${activePayment?.date}`}
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="primary" size="sm" onClick={() => setIsDetailModalOpen(false)}>
              Close
            </Button>
          </div>
        }
      >
        {activePayment && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block">Customer</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{activePayment.customerName}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Amount Settled</span>
                <span className="font-extrabold text-indigo-600 dark:text-indigo-400 text-sm">₹{activePayment.amount.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Gateway Reference ID</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">{activePayment.referenceId}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Settlement Status</span>
                <Badge variant="success" size="sm">{activePayment.status}</Badge>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
