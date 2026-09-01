'use client';

import React, { useState } from 'react';
import {
  Package,
  Search,
  Filter,
  ShoppingCart,
  Eye,
  AlertTriangle,
  Flame,
  CheckCircle2,
  TrendingUp,
  Boxes,
} from 'lucide-react';
import { useAppSettings } from '@/context/AppSettingsContext';
import { initialProducts, productCategories } from '@/data/products';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { Badge } from '@/components/common/Badge';
import { Modal } from '@/components/common/Modal';

export function SellerProductsPage() {
  const { t } = useAppSettings();
  const [products] = useState(initialProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [alertSuccessMessage, setAlertSuccessMessage] = useState('');

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleOpenDetail = (prod) => {
    setSelectedProduct(prod);
    setIsDetailModalOpen(true);
  };

  const handleTriggerRestockAlert = (prod) => {
    setAlertSuccessMessage(`Restock request sent to warehouse manager for ${prod.name} (${prod.sku})!`);
    setTimeout(() => setAlertSuccessMessage(''), 3000);
  };

  const handleQuickSale = (prod) => {
    window.dispatchEvent(new CustomEvent('open-record-sale-modal', { detail: prod }));
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-slate-100">{t('operationalCatalog')}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time aisle stock availability, shift velocity, and quick sale terminal.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="purple" size="md">
            {filteredProducts.length} Store SKUs Tracked
          </Badge>
        </div>
      </div>

      {/* Restock Notification Alert */}
      {alertSuccessMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{alertSuccessMessage}</span>
        </div>
      )}

      {/* Search & Filter */}
      <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="w-full sm:w-80">
          <Input
            placeholder={t('searchPlaceholder')}
            icon={Search}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            options={productCategories.map((c) => ({ value: c, label: c === 'All' ? 'All Categories' : c }))}
            className="w-48"
          />
        </div>
      </div>

      {/* Operational Product Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map((prod) => {
          const isLow = prod.stock <= prod.reorderLevel;
          return (
            <div
              key={prod.id}
              className="p-4 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between space-y-4 hover:border-purple-300 dark:hover:border-purple-800 transition-all"
            >
              <div className="flex items-start gap-3">
                <img
                  src={prod.image}
                  alt={prod.name}
                  className="w-16 h-16 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 flex-shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-slate-400">{prod.category}</span>
                    <Badge variant={isLow ? 'danger' : 'success'} size="sm" dot>
                      {isLow ? t('lowStock') : t('inStock')}
                    </Badge>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate mt-0.5">
                    {t(prod.name)}
                  </h4>
                  <div className="text-xs font-mono text-slate-400 mt-0.5">{prod.sku} • {prod.unit}</div>
                </div>
              </div>

              {/* Operational Metrics */}
              <div className="grid grid-cols-3 gap-2 p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">{t('sellingPrice')}</span>
                  <span className="font-black text-slate-900 dark:text-slate-100">₹{prod.price}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">{t('currentStock')}</span>
                  <span className={`font-black ${isLow ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {prod.stock} {prod.unit}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">{t('unitsSold')}</span>
                  <span className="font-black text-slate-900 dark:text-slate-100">{prod.unitsSold || 32}</span>
                </div>
              </div>

              {/* Seller Actions */}
              <div className="flex items-center justify-between gap-2 pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  icon={Eye}
                  onClick={() => handleOpenDetail(prod)}
                  className="flex-1 text-xs cursor-pointer"
                >
                  {t('details')}
                </Button>

                {isLow ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={AlertTriangle}
                    onClick={() => handleTriggerRestockAlert(prod)}
                    className="flex-1 text-xs bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 border-rose-200 dark:border-rose-800 hover:bg-rose-100 cursor-pointer"
                  >
                    {t('alertRestock')}
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    icon={ShoppingCart}
                    onClick={() => handleQuickSale(prod)}
                    className="flex-1 text-xs bg-purple-600 hover:bg-purple-700 font-bold cursor-pointer"
                  >
                    {t('fastSell')}
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Product Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={selectedProduct?.name || 'Product Details'}
        subtitle={`SKU: ${selectedProduct?.sku}`}
      >
        {selectedProduct && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <img
                src={selectedProduct.image}
                alt={selectedProduct.name}
                className="w-24 h-24 rounded-2xl object-cover border border-slate-200 dark:border-slate-700"
              />
              <div className="space-y-1">
                <Badge variant={selectedProduct.stock <= selectedProduct.reorderLevel ? 'danger' : 'success'} size="sm">
                  {selectedProduct.stockStatus || 'Healthy Stock'}
                </Badge>
                <div className="text-base font-black text-slate-900 dark:text-slate-100">
                  ₹{selectedProduct.price} / {selectedProduct.unit}
                </div>
                <div className="text-xs text-slate-500">
                  Category: <strong>{selectedProduct.category}</strong> • Brand: <strong>{selectedProduct.brand}</strong>
                </div>
                <div className="text-xs text-slate-500">
                  Store Location: <strong>Aisle 3, Shelf B2</strong>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 text-xs">
              <div>
                <span className="text-slate-400 block">Available Stock</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{selectedProduct.stock} units</span>
              </div>
              <div>
                <span className="text-slate-400 block">Reorder Minimum</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{selectedProduct.reorderLevel} units</span>
              </div>
              <div>
                <span className="text-slate-400 block">Daily Velocity</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{selectedProduct.dailyVelocity || 4.2} /day</span>
              </div>
              <div>
                <span className="text-slate-400 block">Shelf Expiry</span>
                <span className="font-bold text-amber-600">{selectedProduct.expiryDays ? `${selectedProduct.expiryDays} days` : 'Fresh Daily'}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setIsDetailModalOpen(false)}>
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={ShoppingCart}
                onClick={() => {
                  setIsDetailModalOpen(false);
                  handleQuickSale(selectedProduct);
                }}
                className="bg-purple-600 hover:bg-purple-700 font-bold"
              >
                Record Sale
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default SellerProductsPage;
