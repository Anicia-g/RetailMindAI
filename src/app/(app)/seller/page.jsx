'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  TrendingUp,
  ShoppingBag,
  Package,
  AlertTriangle,
  Flame,
  Star,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  Clock,
  ShieldAlert,
  Sparkles,
  Zap,
  ShoppingCart,
  IndianRupee,
  Store,
  Tag,
  Cpu,
  Eye,
  Award,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useAppSettings } from '@/context/AppSettingsContext';
import { StatCard } from '@/components/common/StatCard';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { SmartDiscountCard } from '@/components/intelligence/SmartDiscountCard';
import { DiscountAnalysisModal } from '@/components/intelligence/DiscountAnalysisModal';
import { BestCustomerCard } from '@/components/intelligence/BestCustomerCard';
import { CustomerDetailModal } from '@/components/intelligence/CustomerDetailModal';
import { initialProducts } from '@/data/products';
import { initialEmployees } from '@/data/employees';
import { customerService } from '@/services/customerService';
import { productService } from '@/services/productService';

export default function SellerDashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useAppSettings();

  const currentSeller =
    initialEmployees.find((e) => e.email === user?.email) || initialEmployees[0];

  const currentStore = user?.store || currentSeller.store || 'Indiranagar Flagship (Store 01)';

  const [products, setProducts] = useState(initialProducts);
  const [customerAnalytics, setCustomerAnalytics] = useState(null);
  const [selectedProductForAnalysis, setSelectedProductForAnalysis] = useState(null);
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
  const [selectedCustomerDetail, setSelectedCustomerDetail] = useState(null);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    // Load store-specific best customer intelligence
    const loadCustomerData = async () => {
      const analytics = await customerService.getBestCustomerAnalytics(currentStore);
      setCustomerAnalytics(analytics);
    };
    loadCustomerData();
  }, [currentStore]);

  // Inventory alerts for seller store
  const lowStockItems = products.filter((p) => p.stockStatus === 'Low Stock' || p.stockStatus === 'Critical' || p.stock <= p.reorderLevel);
  const expiringItems = products.filter((p) => p.expiryDays && p.expiryDays <= 6);
  const overstockItems = products.filter((p) => p.inventoryLevel === 'Overstock' || p.stock > 90);

  // Best selling products for store
  const bestPerformingProducts = [...products]
    .sort((a, b) => (b.unitsSold || 0) - (a.unitsSold || 0))
    .slice(0, 4);

  // Smart discount spotlight candidate (e.g. Yogurt / Bread with surplus stock or expiring window)
  const discountCandidate =
    products.find((p) => p.smartDiscount && p.smartDiscount.recommended > 0) || products[3];

  const handleOpenPOS = () => {
    window.dispatchEvent(new CustomEvent('open-record-sale-modal'));
  };

  const handleOpenAI = () => {
    window.dispatchEvent(new CustomEvent('open-ai-drawer'));
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
    setToastMessage(`${discountPct}% discount applied to ${prod.name}! Store catalog updated.`);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleViewCustomer = (cust) => {
    setSelectedCustomerDetail(cust);
    setIsCustomerModalOpen(true);
  };

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

      {/* 1. Store, Seller & Shift Status Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-purple-900/40">
        <div className="flex items-center gap-4">
          <img
            src={currentSeller.avatar || user?.image}
            alt={currentSeller.name}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-purple-400/50 shadow-md flex-shrink-0"
          />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-purple-500/30 border border-purple-400/30 text-purple-300">
                STORE: {currentStore.split('(')[0]}
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/30 border border-emerald-400/30 text-emerald-300 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                SHIFT STATUS: ACTIVE
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black mt-1.5">
              SELLER: {user?.name || currentSeller.name}
            </h2>
            <p className="text-xs text-purple-200/80 mt-0.5">
              Department: <strong>{currentSeller.topCategory}</strong> • Rank #{currentSeller.rank} in Store
            </p>
          </div>
        </div>

        {/* Quota Gauge & Quick Actions */}
        <div className="flex items-center gap-3">
          <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-xs border border-white/10 text-right">
            <div className="text-[10px] text-purple-200 uppercase font-bold">Target Achievement</div>
            <div className="text-xl font-black text-amber-400">
              {currentSeller.targetAchievement}% Achieved
            </div>
            <div className="text-[10px] text-slate-300 mt-0.5">
              Rating: ⭐ {currentSeller.rating} • CSAT: 98%
            </div>
          </div>

          <Button
            variant="primary"
            size="md"
            icon={ShoppingCart}
            onClick={handleOpenPOS}
            className="bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-lg shadow-purple-600/30 cursor-pointer"
          >
            Record Sale
          </Button>
        </div>
      </div>

      {/* 2. Today's Performance KPI Cards */}
      <div className="space-y-2.5">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Today's Performance
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Today's Sales"
            value="₹48,250"
            change="+18.4%"
            isPositive={true}
            subtitle="logged in active shift"
            icon={IndianRupee}
            onClick={() => router.push('/seller/sales')}
          />
          <StatCard
            title="Orders Handled"
            value="126 Orders"
            change="4.2/hr"
            isPositive={true}
            subtitle="avg checkout 1.4m"
            icon={ShoppingBag}
            onClick={() => router.push('/seller/sales')}
          />
          <StatCard
            title="Products Sold"
            value="342 Units"
            change="+28%"
            isPositive={true}
            subtitle="dairy & bakery lead"
            icon={Package}
            onClick={() => router.push('/seller/products')}
          />
          <StatCard
            title="Target Achievement"
            value="124%"
            change="Top 3 in Store"
            isPositive={true}
            subtitle="monthly quota ₹2.5L"
            icon={Star}
            onClick={() => router.push('/seller/performance')}
          />
        </div>
      </div>

      {/* 3. ⚠️ Inventory Alerts (Low Stock, Critical, Expiring, Overstock) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Low & Critical Stock Alerts */}
        <div className="p-4 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4" />
              <span>Low & Critical Stock ({lowStockItems.length})</span>
            </h3>
            <Badge variant="danger" size="sm">Restock Required</Badge>
          </div>

          <div className="space-y-2.5 divide-y divide-slate-100 dark:divide-slate-800">
            {lowStockItems.slice(0, 2).map((item) => (
              <div key={item.id} className="pt-2.5 first:pt-0 flex items-center justify-between gap-2.5 text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <img src={item.image} alt={item.name} className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
                  <div className="truncate">
                    <div className="font-bold text-slate-900 dark:text-slate-100 truncate">{item.name}</div>
                    <div className="text-[10px] text-rose-600 font-semibold">{item.expectedStockoutDays || 2} days runway</div>
                  </div>
                </div>
                <span className="font-black text-rose-600 whitespace-nowrap">{item.stock} left</span>
              </div>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs"
            onClick={() => router.push('/seller/inventory')}
          >
            View Inventory Alerts
          </Button>
        </div>

        {/* Expiring Products Shelf Life */}
        <div className="p-4 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>Expiring Products ({expiringItems.length})</span>
            </h3>
            <Badge variant="warning" size="sm">Discount Active</Badge>
          </div>

          <div className="space-y-2.5 divide-y divide-slate-100 dark:divide-slate-800">
            {expiringItems.slice(0, 2).map((item) => (
              <div key={item.id} className="pt-2.5 first:pt-0 flex items-center justify-between gap-2.5 text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <img src={item.image} alt={item.name} className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
                  <div className="truncate">
                    <div className="font-bold text-slate-900 dark:text-slate-100 truncate">{item.name}</div>
                    <div className="text-[10px] text-amber-600 font-semibold">Expires in {item.expiryDays} days</div>
                  </div>
                </div>
                <span className="font-bold text-slate-700 dark:text-slate-300">{item.smartDiscount?.recommended || 15}% Markdown</span>
              </div>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs"
            onClick={() => router.push('/seller/inventory')}
          >
            Manage Clearance Items
          </Button>
        </div>

        {/* Overstocked / Surplus */}
        <div className="p-4 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-cyan-600 dark:text-cyan-400 flex items-center gap-1.5">
              <Layers className="w-4 h-4" />
              <span>Overstock Buffer ({overstockItems.length})</span>
            </h3>
            <Badge variant="info" size="sm">Healthy</Badge>
          </div>

          <div className="space-y-2.5 divide-y divide-slate-100 dark:divide-slate-800">
            {overstockItems.slice(0, 2).map((item) => (
              <div key={item.id} className="pt-2.5 first:pt-0 flex items-center justify-between gap-2.5 text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <img src={item.image} alt={item.name} className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
                  <div className="truncate">
                    <div className="font-bold text-slate-900 dark:text-slate-100 truncate">{item.name}</div>
                    <div className="text-[10px] text-slate-400">{item.unit} • Regular turnover</div>
                  </div>
                </div>
                <span className="font-black text-slate-900 dark:text-slate-100">{item.stock} units</span>
              </div>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs"
            onClick={() => router.push('/seller/products')}
          >
            View Store Products
          </Button>
        </div>
      </div>

      {/* 4. 🏷️ Smart Discount Recommendation Card */}
      {discountCandidate && (
        <SmartDiscountCard
          product={discountCandidate}
          onViewAnalysis={handleViewAnalysis}
          onApplyDiscount={handleApplyDiscount}
        />
      )}

      {/* 5. 🏆 Best Customers Spotlight */}
      {customerAnalytics && (
        <BestCustomerCard
          analytics={customerAnalytics}
          onViewCustomer={handleViewCustomer}
        />
      )}

      {/* 6. Best Selling Products */}
      <div className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                🔥 Best Selling Products (Store Velocity)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Top moving products under your active shift management
              </p>
            </div>
          </div>

          <Button variant="ghost" size="sm" onClick={() => router.push('/seller/best-sellers')}>
            All Best Sellers <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {bestPerformingProducts.map((prod) => (
            <div
              key={prod.id}
              className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex flex-col justify-between space-y-3"
            >
              <div className="flex items-center gap-3">
                <img
                  src={prod.image}
                  alt={prod.name}
                  className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700 flex-shrink-0"
                />
                <div className="min-w-0">
                  <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">
                    {prod.name}
                  </h4>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">₹{prod.price} • {prod.sku}</div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">Units Sold</span>
                  <span className="font-black text-slate-900 dark:text-slate-100">
                    {prod.unitsSold || 45} units
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">Current Stock</span>
                  <span
                    className={`font-bold text-xs ${
                      prod.stock <= prod.reorderLevel ? 'text-rose-600' : 'text-emerald-600'
                    }`}
                  >
                    {prod.stock} in stock
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 7. 🤖 Smart Selling Insights */}
      <div className="p-5 rounded-3xl border border-indigo-200 dark:border-indigo-900/60 bg-gradient-to-r from-indigo-50/60 via-white to-indigo-50/30 dark:from-indigo-950/20 dark:via-slate-900 dark:to-indigo-950/10 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-sm font-black text-indigo-900 dark:text-indigo-200">
            🤖 Smart Selling Insights (Automated Analytics & ML Displays)
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-indigo-100 dark:border-indigo-900/40 space-y-1">
            <span className="font-bold text-indigo-700 dark:text-indigo-300">📈 Product Velocity Surge</span>
            <p className="text-slate-600 dark:text-slate-300">
              "Farm Fresh Milk 1L is selling <strong>32% faster than last week</strong>. Stock buffer (24 units) will deplete within 31 hours."
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-indigo-100 dark:border-indigo-900/40 space-y-1">
            <span className="font-bold text-indigo-700 dark:text-indigo-300">👤 Customer Retention Alert</span>
            <p className="text-slate-600 dark:text-slate-300">
              "Ananya Iyer is a high-value customer (₹68,420 spent) who regularly orders weekly organic dairy. Send Smart Reorder reminder."
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-indigo-100 dark:border-indigo-900/40 space-y-1">
            <span className="font-bold text-indigo-700 dark:text-indigo-300">🏷️ Spoilage Prevention</span>
            <p className="text-slate-600 dark:text-slate-300">
              "Greek Probiotic Yogurt has high inventory (145 units) but declining sales velocity. C4.5 algorithm recommends <strong>15% markdown</strong>."
            </p>
          </div>
        </div>
      </div>

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

      {/* Customer Detail Modal */}
      <CustomerDetailModal
        customer={selectedCustomerDetail}
        isOpen={isCustomerModalOpen}
        onClose={() => {
          setIsCustomerModalOpen(false);
          setSelectedCustomerDetail(null);
        }}
      />
    </div>
  );
}
