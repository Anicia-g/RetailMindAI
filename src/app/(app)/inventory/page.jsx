'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Boxes,
  AlertTriangle,
  TrendingUp,
  ShoppingCart,
  Sliders,
  Search,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldAlert
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
import { InventoryChart } from '@/components/charts/InventoryChart';
import { initialInventory } from '@/data/inventory';
import { initialProducts } from '@/data/products';

export default function InventoryPage() {
  const router = useRouter();
  const { t } = useAppSettings();

  const [inventoryList, setInventoryList] = useState(initialInventory);
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Adjustment Modal
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [activeItem, setActiveItem] = useState(null);
  const [adjustmentQty, setAdjustmentQty] = useState('');
  const [adjustmentReason, setAdjustmentReason] = useState('Stock Count Audit');

  const filteredInventory = useMemo(() => {
    return inventoryList.filter((item) => {
      const matchesSearch =
        item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRisk =
        riskFilter === 'All' ||
        (riskFilter === 'High' && (item.riskLevel === 'High' || item.riskLevel === 'Critical')) ||
        item.riskLevel === riskFilter;

      return matchesSearch && matchesRisk;
    });
  }, [inventoryList, searchTerm, riskFilter]);

  const totalPages = Math.ceil(filteredInventory.length / itemsPerPage) || 1;
  const paginatedInventory = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredInventory.slice(start, start + itemsPerPage);
  }, [filteredInventory, currentPage]);

  const highRiskItem = inventoryList.find((i) => i.sku === 'WM-001') || inventoryList[0];

  const handleOpenAdjust = (item) => {
    setActiveItem(item);
    setAdjustmentQty(String(item.currentStock));
    setAdjustmentReason('Stock Count Audit');
    setIsAdjustModalOpen(true);
  };

  const handleSaveAdjust = (e) => {
    e.preventDefault();
    if (!activeItem) return;

    const newStock = Number(adjustmentQty) || 0;
    const days = (newStock / (activeItem.dailyVelocity || 2)).toFixed(1);
    const newStatus = newStock <= activeItem.minStock ? 'Low Stock' : 'Healthy';
    const newRisk = newStock <= activeItem.minStock ? 'High' : 'Low';

    setInventoryList(
      inventoryList.map((i) =>
        i.id === activeItem.id
          ? {
              ...i,
              currentStock: newStock,
              daysRemaining: Number(days),
              status: newStatus,
              riskLevel: newRisk,
            }
          : i
      )
    );
    setIsAdjustModalOpen(false);
  };

  const handleTriggerPO = (item) => {
    const targetProduct = initialProducts.find((p) => p.sku === item.sku) || {
      id: item.productId,
      name: item.productName,
      sku: item.sku,
      stock: item.currentStock,
      suggestedReorder: item.suggestedReorder || 40,
      costPrice: 1100,
    };
    window.dispatchEvent(new CustomEvent('open-po-modal', { detail: targetProduct }));
  };

  const columns = [
    {
      header: t('productName'),
      accessor: 'productName',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex-shrink-0 shadow-2xs">
            <img
              src={row.image || 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=400&q=80'}
              alt={row.productName}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          <div className="min-w-0">
            <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 truncate">
              <span>{row.productName}</span>
              {row.riskLevel === 'Critical' && (
                <Badge variant="danger" size="sm">
                  CRITICAL
                </Badge>
              )}
            </div>
            <div className="text-xs text-slate-400 font-mono">
              {row.sku} • {row.category}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: t('stock'),
      accessor: 'currentStock',
      render: (row) => (
        <div>
          <div className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">
            {row.currentStock} units
          </div>
          <div className="text-[10px] text-slate-400">Velocity: {row.dailyVelocity}/day</div>
        </div>
      ),
    },
    {
      header: t('daysRemaining'),
      accessor: 'daysRemaining',
      render: (row) => {
        const isUrgent = row.daysRemaining <= 4;
        return (
          <span
            className={`font-bold text-xs ${
              isUrgent ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-300'
            }`}
          >
            {row.daysRemaining} Days
          </span>
        );
      },
    },
    {
      header: t('stockoutProbability'),
      accessor: 'stockoutProbability',
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-16 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className={`h-full rounded-full ${
                row.stockoutProbability >= 70
                  ? 'bg-rose-500'
                  : row.stockoutProbability >= 30
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${row.stockoutProbability}%` }}
            />
          </div>
          <span className="text-xs font-bold">{row.stockoutProbability}%</span>
        </div>
      ),
    },
    {
      header: t('reorderLevel'),
      accessor: 'minStock',
      render: (row) => <span className="text-xs font-semibold">{row.minStock} units</span>,
    },
    {
      header: t('actions'),
      accessor: 'actions',
      align: 'right',
      render: (row) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={Sliders}
            onClick={() => handleOpenAdjust(row)}
          >
            Adjust
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={ShoppingCart}
            onClick={() => handleTriggerPO(row)}
          >
            Create PO
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-slate-100">{t('inventoryOverview')}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time multi-echelon stock health, depletion runaways, and AI reorder triggers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="md"
            icon={ShoppingCart}
            onClick={() => handleTriggerPO(highRiskItem)}
          >
            {t('createPO')}
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Catalog SKUs"
          value="8 Products"
          change="100% Tracked"
          isPositive={true}
          icon={Boxes}
        />
        <StatCard
          title="Low / Critical Stock"
          value="3 Products"
          change="87% Stockout Risk"
          isPositive={false}
          subtitle="action required"
          icon={AlertTriangle}
        />
        <StatCard
          title="Est. Stockout Value"
          value="₹1,58,800"
          change="3-day runway"
          isPositive={false}
          subtitle="potential lost sales"
          icon={ShieldAlert}
        />
      </div>

      {/* Prominent High-Risk Intelligence Banner */}
      <div className="p-5 rounded-2xl border-2 border-rose-500/40 bg-gradient-to-r from-rose-50/70 via-white to-rose-50/30 dark:from-rose-950/30 dark:via-slate-900 dark:to-slate-900/60 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-2xl bg-rose-600 text-white shadow-md shadow-rose-600/30 flex-shrink-0 mt-0.5">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="danger" size="sm">
                HIGH RISK INTELLIGENCE
              </Badge>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                {highRiskItem.productName} ({highRiskItem.sku})
              </span>
            </div>
            <div className="mt-1 text-sm font-bold text-slate-900 dark:text-slate-100">
              Stock-out Probability: <span className="text-rose-600">87%</span> | Expected Depletion:{' '}
              <span className="text-rose-600">3.1 Days</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
              <strong>Root cause:</strong> Sales velocity accelerated by +32% across Bangalore & Mumbai stores. Recommended replenishment: <strong>40 units</strong>.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            icon={TrendingUp}
            onClick={() => router.push('/forecasting')}
          >
            {t('viewForecast')}
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={ShoppingCart}
            onClick={() => handleTriggerPO(highRiskItem)}
          >
            {t('createPO')} (40 Units)
          </Button>
        </div>
      </div>

      {/* Inventory Health Bar */}
      <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            {t('inventoryHealth')}
          </h3>
          <span className="text-xs text-slate-400">Live Aggregate Thresholds</span>
        </div>
        <InventoryChart healthyCount={5} lowStockCount={2} criticalCount={1} />
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="w-full md:w-80">
          <Input
            placeholder="Search inventory items, SKUs..."
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
            value={riskFilter}
            onChange={(e) => {
              setRiskFilter(e.target.value);
              setCurrentPage(1);
            }}
            options={[
              { value: 'All', label: 'All Risk Profiles' },
              { value: 'High', label: 'High & Critical Risk' },
              { value: 'Low', label: 'Low Risk / Healthy' },
            ]}
            className="w-48"
          />
        </div>
      </div>

      {/* Inventory Table */}
      <Table
        columns={columns}
        data={paginatedInventory}
        emptyMessage={t('noDataMatchingFilter')}
      />

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredInventory.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
      />

      {/* Stock Adjustment Modal */}
      <Modal
        isOpen={isAdjustModalOpen}
        onClose={() => setIsAdjustModalOpen(false)}
        title="Adjust Physical Stock Count"
        subtitle={`SKU: ${activeItem?.sku} — ${activeItem?.productName}`}
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="outline" size="sm" onClick={() => setIsAdjustModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveAdjust}>
              Save Stock Adjustment
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSaveAdjust} className="space-y-4">
          <Input
            label="New Stock Quantity"
            type="number"
            min="0"
            required
            value={adjustmentQty}
            onChange={(e) => setAdjustmentQty(e.target.value)}
          />
          <Select
            label="Adjustment Reason"
            value={adjustmentReason}
            onChange={(e) => setAdjustmentReason(e.target.value)}
            options={[
              'Stock Count Audit',
              'Damaged / Expired In Transit',
              'Internal Store Transfer',
              'Manual Reconciliation',
            ]}
          />
        </form>
      </Modal>
    </div>
  );
}
