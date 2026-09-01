'use client';

import React, { useState, useMemo } from 'react';
import {
  Boxes,
  ShieldAlert,
  Clock,
  Layers,
  AlertTriangle,
  CheckCircle2,
  Search,
  Filter,
  Send,
  Sparkles,
  Tag,
  Eye,
  Percent,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { initialProducts } from '@/data/products';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Badge } from '@/components/common/Badge';
import { Table } from '@/components/common/Table';
import { DiscountAnalysisModal } from '@/components/intelligence/DiscountAnalysisModal';
import { productService } from '@/services/productService';

export default function SellerInventoryPage() {
  const { user } = useAuth();
  const currentStore = user?.store || 'Indiranagar Flagship (Store 01)';

  const [products, setProducts] = useState(initialProducts);
  const [filterTab, setFilterTab] = useState('all'); // 'all' | 'low-stock' | 'expiring' | 'overstock'
  const [searchTerm, setSearchTerm] = useState('');
  const [requestedRestocks, setRequestedRestocks] = useState({});
  const [selectedProductForAnalysis, setSelectedProductForAnalysis] = useState(null);
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const lowStockItems = products.filter((p) => p.stock <= p.reorderLevel || p.stockStatus === 'Low Stock' || p.stockStatus === 'Critical');
  const expiringItems = products.filter((p) => p.expiryDays && p.expiryDays <= 6);
  const overstockItems = products.filter((p) => p.inventoryLevel === 'Overstock' || p.stock > 90);

  const getFilteredItems = useMemo(() => {
    let list = [...products];
    if (filterTab === 'low-stock') list = lowStockItems;
    else if (filterTab === 'expiring') list = expiringItems;
    else if (filterTab === 'overstock') list = overstockItems;

    return list.filter(
      (p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, filterTab, searchTerm, lowStockItems, expiringItems, overstockItems]);

  const handleRequestRestock = (sku, name) => {
    setRequestedRestocks((prev) => ({ ...prev, [sku]: true }));
    setToastMessage(`Restock requisition sent to store warehouse for ${name} (${sku})!`);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleViewAnalysis = (prod) => {
    setSelectedProductForAnalysis(prod);
    setIsAnalysisModalOpen(true);
  };

  const handleApplyDiscount = async (prod, discountPct) => {
    await productService.updateProductDiscount(prod.id, discountPct);
    setProducts((prev) =>
      prev.map((p) => (p.id === prod.id ? { ...p, discountPct, price: Math.round(p.originalPrice * (1 - discountPct / 100)) } : p))
    );
    setToastMessage(`${discountPct}% smart discount applied to ${prod.name}! Store catalog updated.`);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const columns = [
    {
      header: 'Product',
      accessor: 'name',
      render: (row) => (
        <div className="flex items-center gap-3">
          <img src={row.image} alt={row.name} className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700 flex-shrink-0" />
          <div className="min-w-0">
            <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 truncate">{row.name}</div>
            <div className="text-[10px] text-slate-400 font-mono">{row.sku} • {row.unit}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Store Stock',
      accessor: 'stock',
      render: (row) => {
        const isLow = row.stock <= row.reorderLevel;
        return (
          <div>
            <span className={`font-black text-xs ${isLow ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-slate-100'}`}>
              {row.stock} {row.unit}
            </span>
            <div className="text-[10px] text-slate-400">Min: {row.reorderLevel}</div>
          </div>
        );
      },
    },
    {
      header: 'Daily Sales',
      accessor: 'dailyVelocity',
      render: (row) => (
        <span className="font-bold text-xs text-slate-700 dark:text-slate-300">
          {row.dailyVelocity} /day
        </span>
      ),
    },
    {
      header: 'Days Remaining',
      accessor: 'expectedStockoutDays',
      render: (row) => {
        const days = row.expectedStockoutDays || Math.max(1, Math.round(row.stock / (row.dailyVelocity || 1)));
        const isCritical = days <= 3;
        return (
          <span className={`text-xs font-black ${isCritical ? 'text-rose-600' : 'text-slate-700 dark:text-slate-300'}`}>
            {days} Days
          </span>
        );
      },
    },
    {
      header: 'Risk Level',
      accessor: 'stockoutRisk',
      render: (row) => {
        if (row.stock <= row.reorderLevel) {
          return <Badge variant="danger" size="sm" dot>HIGH RISK</Badge>;
        }
        if (row.expiryDays && row.expiryDays <= 6) {
          return <Badge variant="warning" size="sm" dot>MEDIUM (EXPIRY)</Badge>;
        }
        if (row.stock > 90) {
          return <Badge variant="info" size="sm">LOW (OVERSTOCK)</Badge>;
        }
        return <Badge variant="success" size="sm">OPTIMAL</Badge>;
      },
    },
    {
      header: 'Expiry Shelf-Life',
      accessor: 'expiryDays',
      render: (row) => (
        <span className={`text-xs font-semibold ${row.expiryDays && row.expiryDays <= 6 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500'}`}>
          {row.expiryDays ? `${row.expiryDays} Days` : '90+ Days'}
        </span>
      ),
    },
    {
      header: 'Smart Recommendation',
      accessor: 'smartDiscount',
      render: (row) => {
        if (row.stock <= row.reorderLevel) {
          return <span className="text-xs font-black text-rose-600">Restock Urgently</span>;
        }
        if (row.smartDiscount && row.smartDiscount.recommended > 0) {
          return (
            <span className="text-xs font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5" />
              {row.smartDiscount.recommended}% Discount ({row.smartDiscount.model || 'C4.5'})
            </span>
          );
        }
        return <span className="text-xs text-slate-400">No Action Required</span>;
      },
    },
    {
      header: 'Actions',
      accessor: 'actions',
      align: 'right',
      render: (row) => {
        const isRequested = requestedRestocks[row.sku];
        const isLow = row.stock <= row.reorderLevel;
        const hasDiscountRec = row.smartDiscount && row.smartDiscount.recommended > 0;

        return (
          <div className="flex items-center justify-end gap-1.5">
            {isLow ? (
              <button
                onClick={() => handleRequestRestock(row.sku, row.name)}
                disabled={isRequested}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  isRequested
                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300'
                    : 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs'
                }`}
              >
                {isRequested ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5" />}
                <span>{isRequested ? 'Requested' : 'Restock'}</span>
              </button>
            ) : hasDiscountRec ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewAnalysis(row)}
                  className="text-xs font-bold"
                >
                  View Analysis
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleApplyDiscount(row, row.smartDiscount.recommended)}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs"
                >
                  Apply {row.smartDiscount.recommended}%
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleViewAnalysis(row)}
                className="text-xs text-slate-500"
              >
                Inspect
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-7 pb-16">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center justify-between animate-fade-in shadow-sm">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {toastMessage}
          </span>
          <button onClick={() => setToastMessage('')} className="font-black text-xs hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
            STORE INVENTORY TERMINAL
          </span>
          <span className="text-xs text-slate-400">
            {currentStore.split('(')[0]}
          </span>
        </div>
        <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 mt-1">
          MY STORE INVENTORY
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Aisle stock levels, shelf-life clearance windows, C4.5/ID3 discount recommendations, and 1-click warehouse restocks.
        </p>
      </div>

      {/* 3 Alert Category Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => setFilterTab(filterTab === 'low-stock' ? 'all' : 'low-stock')}
          className={`p-4 rounded-3xl border transition-all cursor-pointer ${
            filterTab === 'low-stock'
              ? 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-500 shadow-sm ring-1 ring-rose-400'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4" />
              Low Stock Requisition
            </span>
            <Badge variant="danger" size="sm">{lowStockItems.length} SKUs</Badge>
          </div>
          <div className="text-xl font-black text-slate-900 dark:text-slate-100 mt-2">
            {lowStockItems.length} Products
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Below minimum safety reorder buffer</p>
        </div>

        <div
          onClick={() => setFilterTab(filterTab === 'expiring' ? 'all' : 'expiring')}
          className={`p-4 rounded-3xl border transition-all cursor-pointer ${
            filterTab === 'expiring'
              ? 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-500 shadow-sm ring-1 ring-amber-400'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              Approaching Expiry
            </span>
            <Badge variant="warning" size="sm">{expiringItems.length} SKUs</Badge>
          </div>
          <div className="text-xl font-black text-slate-900 dark:text-slate-100 mt-2">
            {expiringItems.length} Products
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Within 6-day shelf life (markdown recommended)</p>
        </div>

        <div
          onClick={() => setFilterTab(filterTab === 'overstock' ? 'all' : 'overstock')}
          className={`p-4 rounded-3xl border transition-all cursor-pointer ${
            filterTab === 'overstock'
              ? 'bg-cyan-50/80 dark:bg-cyan-950/40 border-cyan-500 shadow-sm ring-1 ring-cyan-400'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-cyan-600 dark:text-cyan-400 flex items-center gap-1.5">
              <Layers className="w-4 h-4" />
              Overstock Buffer
            </span>
            <Badge variant="info" size="sm">{overstockItems.length} SKUs</Badge>
          </div>
          <div className="text-xl font-black text-slate-900 dark:text-slate-100 mt-2">
            {overstockItems.length} Products
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Surplus buffer ready for bundle promotions</p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="p-4 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="w-full sm:w-80">
          <Input
            placeholder="Search store inventory SKU or item name..."
            icon={Search}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs">
          {[
            { id: 'all', label: 'All Store SKUs' },
            { id: 'low-stock', label: 'Low Stock' },
            { id: 'expiring', label: 'Expiring' },
            { id: 'overstock', label: 'Overstock' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterTab(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                filterTab === tab.id
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Table */}
      <Table
        columns={columns}
        data={getFilteredItems}
        emptyMessage="No inventory items found matching your filter selection."
      />

      {/* Discount Analysis Modal */}
      <DiscountAnalysisModal
        product={selectedProductForAnalysis}
        isOpen={isAnalysisModalOpen}
        onClose={() => {
          setIsAnalysisModalOpen(false);
          setSelectedProductForAnalysis(null);
        }}
        onDiscountApplied={handleApplyDiscount}
      />
    </div>
  );
}
