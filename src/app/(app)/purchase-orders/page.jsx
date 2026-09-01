'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText,
  Plus,
  Search,
  Eye,
  CheckCircle2,
  Clock,
  Truck,
  Sparkles,
  ShoppingCart,
  IndianRupee,
  AlertCircle
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
import { initialPurchaseOrders, aiSuggestedOrder } from '@/data/purchaseOrders';

export default function PurchaseOrdersPage() {
  const { t } = useAppSettings();

  const [poList, setPoList] = useState(initialPurchaseOrders);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Modals
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [activePO, setActivePO] = useState(null);

  // Listen for global PO created events
  useEffect(() => {
    const handlePoCreated = (e) => {
      if (e.detail) {
        setPoList((prev) => [e.detail, ...prev]);
      }
    };
    window.addEventListener('po-created', handlePoCreated);
    return () => window.removeEventListener('po-created', handlePoCreated);
  }, []);

  const filteredPOs = useMemo(() => {
    return poList.filter((po) => {
      const matchSearch =
        po.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        po.supplier.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = statusFilter === 'All' || po.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [poList, searchTerm, statusFilter]);

  const totalPages = Math.ceil(filteredPOs.length / itemsPerPage) || 1;
  const paginatedPOs = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredPOs.slice(start, start + itemsPerPage);
  }, [filteredPOs, currentPage]);

  const handleOpenDetail = (po) => {
    setActivePO(po);
    setIsDetailModalOpen(true);
  };

  const handleCreateNewPO = () => {
    window.dispatchEvent(new CustomEvent('open-po-modal'));
  };

  const handleApprovePO = (poId) => {
    setPoList(
      poList.map((p) => (p.id === poId ? { ...p, status: 'In Transit' } : p))
    );
    if (activePO && activePO.id === poId) {
      setActivePO({ ...activePO, status: 'In Transit' });
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Delivered':
        return 'success';
      case 'In Transit':
        return 'info';
      case 'Pending Approval':
        return 'warning';
      default:
        return 'default';
    }
  };

  const columns = [
    {
      header: t('poNumber'),
      accessor: 'poNumber',
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
            {row.poNumber}
          </div>
          {row.isAiGenerated && (
            <Badge variant="purple" size="sm">
              AI Generated
            </Badge>
          )}
        </div>
      ),
    },
    {
      header: t('supplier'),
      accessor: 'supplier',
      render: (row) => <span className="font-bold text-xs text-slate-800 dark:text-slate-200">{row.supplier}</span>,
    },
    {
      header: 'Order Date',
      accessor: 'orderDate',
      render: (row) => <span className="text-xs text-slate-500">{row.orderDate}</span>,
    },
    {
      header: 'Expected Delivery',
      accessor: 'expectedDelivery',
      render: (row) => (
        <span className="inline-flex items-center gap-1 text-xs font-semibold">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          {row.expectedDelivery}
        </span>
      ),
    },
    {
      header: t('estimatedCost'),
      accessor: 'totalCost',
      render: (row) => (
        <span className="font-extrabold text-xs text-slate-900 dark:text-slate-100">
          ₹{row.totalCost.toLocaleString()}
        </span>
      ),
    },
    {
      header: t('status'),
      accessor: 'status',
      render: (row) => (
        <Badge variant={getStatusBadge(row.status)} size="sm" dot>
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
          <h2 className="text-xl font-black text-slate-900 dark:text-slate-100">{t('purchaseOrdersManagement')}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Algorithmic procurement pipelines, smart batching, supplier purchase orders, and fulfillment tracking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={handleCreateNewPO}
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20"
          >
            {t('createPO')}
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Active Procurement Value"
          value="₹1,85,450"
          change="3 In Transit / Review"
          isPositive={null}
          icon={IndianRupee}
        />
        <StatCard
          title="AI Automated Orders"
          value="67%"
          change="+18% Accuracy"
          isPositive={true}
          icon={Sparkles}
        />
        <StatCard
          title="On-Time Delivery SLA"
          value="96.4%"
          change="Avg 3.1 Days"
          isPositive={true}
          icon={Truck}
        />
      </div>

      {/* AI Suggested Reorder Banner */}
      <div className="p-5 rounded-2xl border-2 border-indigo-500/40 bg-gradient-to-r from-indigo-50/70 via-white to-indigo-50/30 dark:from-indigo-950/40 dark:via-slate-900 dark:to-slate-900/60 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-600/30 flex-shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="purple" size="sm">
                AI SMART REORDER BATCH
              </Badge>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                Supplier: {aiSuggestedOrder.supplier}
              </span>
            </div>
            <div className="mt-1 font-bold text-sm text-slate-900 dark:text-slate-100">
              Suggested Order: 40 units Wireless Mouse + 25 units Gaming Keyboard
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
              Estimated Total Cost: <strong>₹{aiSuggestedOrder.estimatedCost.toLocaleString()}</strong> • Projected to eliminate stockout risk for 21 days.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-shrink-0">
          <Button
            variant="primary"
            size="sm"
            icon={ShoppingCart}
            onClick={handleCreateNewPO}
          >
            Create Purchase Order
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="w-full md:w-80">
          <Input
            placeholder="Search PO number, supplier..."
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
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            options={[
              { value: 'All', label: 'All Statuses' },
              { value: 'Pending Approval', label: 'Pending Approval' },
              { value: 'In Transit', label: 'In Transit' },
              { value: 'Delivered', label: 'Delivered' },
            ]}
            className="w-48"
          />
        </div>
      </div>

      {/* PO Table */}
      <Table
        columns={columns}
        data={paginatedPOs}
        emptyMessage={t('noDataMatchingFilter')}
      />

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredPOs.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
      />

      {/* PO Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={`Purchase Order: ${activePO?.poNumber}`}
        subtitle={`Supplier: ${activePO?.supplier} • Ordered on ${activePO?.orderDate}`}
        footer={
          <div className="flex items-center justify-between w-full">
            <div>
              {activePO?.status === 'Pending Approval' && (
                <Button
                  variant="success"
                  size="sm"
                  icon={CheckCircle2}
                  onClick={() => handleApprovePO(activePO.id)}
                >
                  Approve & Dispatch PO
                </Button>
              )}
            </div>
            <Button variant="primary" size="sm" onClick={() => setIsDetailModalOpen(false)}>
              Close
            </Button>
          </div>
        }
      >
        {activePO && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block">Status</span>
                <Badge variant={getStatusBadge(activePO.status)} size="sm">{activePO.status}</Badge>
              </div>
              <div>
                <span className="text-slate-400 block">Expected Arrival</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{activePO.expectedDelivery}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Total Valuation</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">₹{activePO.totalCost.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Generation Type</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {activePO.isAiGenerated ? 'AI Smart Batch' : 'Manual'}
                </span>
              </div>
            </div>

            {/* Line items */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 text-[11px] font-bold uppercase tracking-wider text-slate-500 flex justify-between">
                <span>Ordered Item</span>
                <span className="w-20 text-center">Qty</span>
                <span className="w-24 text-right">Unit Cost</span>
                <span className="w-24 text-right">Total</span>
              </div>
              {activePO.items?.map((it, idx) => (
                <div key={idx} className="p-3 flex items-center justify-between text-xs font-medium">
                  <div className="flex-1">
                    <div className="font-bold">{it.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{it.sku}</div>
                  </div>
                  <div className="w-20 text-center font-bold">{it.quantity}</div>
                  <div className="w-24 text-right text-slate-500">₹{it.unitCost}</div>
                  <div className="w-24 text-right font-bold text-slate-900 dark:text-slate-100">
                    ₹{it.total.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>

            {activePO.notes && (
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-400">
                <strong className="text-slate-800 dark:text-slate-200">Procurement Notes:</strong> {activePO.notes}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
