'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  IndianRupee,
  Package,
  AlertTriangle,
  ShoppingBag,
  Sparkles,
  ArrowRight,
  TrendingUp,
  ShieldAlert,
  Users,
  ShoppingCart,
  Eye,
  Bot,
  Calendar,
  Layers,
  Award,
  Zap,
  Tag
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useAppSettings } from '@/context/AppSettingsContext';
import { StatCard } from '@/components/common/StatCard';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { SalesChart } from '@/components/charts/SalesChart';
import { InventoryChart } from '@/components/charts/InventoryChart';
import { ProductIntelligenceModal } from '@/components/intelligence/ProductIntelligenceModal';
import { CustomerClusteringModal } from '@/components/intelligence/CustomerClusteringModal';
import { BestSellingProducts } from '@/components/analytics/BestSellingProducts';
import { TopCustomersLeaderboard } from '@/components/analytics/TopCustomersLeaderboard';
import { StarSellersLeaderboard } from '@/components/analytics/StarSellersLeaderboard';
import { CustomerIntelligenceSection } from '@/components/analytics/CustomerIntelligenceSection';
import { SmartDiscountSection } from '@/components/analytics/SmartDiscountSection';
import { initialProducts } from '@/data/products';
import { initialCustomers, initialCustomerClusters } from '@/data/customers';
import { initialEmployees } from '@/data/employees';

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useAppSettings();

  const [products] = useState(initialProducts);
  const [customers] = useState(initialCustomers);
  const [employees] = useState(initialEmployees);
  const [clusters, setClusters] = useState(initialCustomerClusters);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isClusteringModalOpen, setIsClusteringModalOpen] = useState(false);

  const criticalProduct = products.find((p) => p.sku === 'MILK-001') || products[0];

  const handleOpenAnalysis = (product = criticalProduct) => {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
  };

  const handleCreatePO = (product = criticalProduct) => {
    window.dispatchEvent(new CustomEvent('open-po-modal', { detail: product }));
  };

  const handleOpenAI = () => {
    window.dispatchEvent(new CustomEvent('open-ai-drawer'));
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Banner / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-indigo-950 via-indigo-900 to-slate-950 text-white shadow-xl border border-indigo-800/40">
        <div>
          <div className="flex items-center gap-2 text-indigo-300 text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>RetailMind AI Enterprise Command Center</span>
          </div>
          <h2 className="text-xl sm:text-3xl font-black mt-1 tracking-tight">
            {t('goodMorning')}, {user?.name || 'Admin'}
          </h2>
          <p className="text-xs text-indigo-200/90 mt-1 max-w-2xl">
            {t('taglineSubtitle')} Real-time multi-store inventory synchronization, predictive stock velocity, and ML classification active.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="secondary"
            size="sm"
            icon={Bot}
            onClick={handleOpenAI}
            className="bg-white/10 text-white hover:bg-white/20 border-white/20 cursor-pointer"
          >
            {t('aiAssistant')}
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={ShoppingCart}
            onClick={() => handleCreatePO(criticalProduct)}
            className="bg-indigo-500 hover:bg-indigo-600 text-white shadow-md shadow-indigo-500/30 cursor-pointer font-bold"
          >
            {t('createPO')}
          </Button>
        </div>
      </div>

      {/* Primary 8-KPI Analytics Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Enterprise Financial & Operational KPIs
          </h3>
          <span className="text-xs text-slate-400">Last 30 Days Consolidated</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard
            title={t('totalSales')}
            value="₹12.4L"
            change="+14.2%"
            isPositive={true}
            subtitle="vs last month target"
            icon={IndianRupee}
            onClick={() => router.push('/sales')}
          />
          <StatCard
            title="Today's Sales"
            value="₹84,200"
            change="+18.5%"
            isPositive={true}
            subtitle="142 orders processed"
            icon={TrendingUp}
            onClick={() => router.push('/sales')}
          />
          <StatCard
            title={t('totalOrders')}
            value="2,450"
            change="+8.6%"
            isPositive={true}
            subtitle="avg order value ₹506"
            icon={ShoppingBag}
            onClick={() => router.push('/sales')}
          />
          <StatCard
            title="Total Customers"
            value="890"
            change="+24 new"
            isPositive={true}
            subtitle="82% active loyalty rate"
            icon={Users}
            onClick={() => router.push('/customers')}
          />
          <StatCard
            title="Total Products"
            value="48 SKUs"
            change="100% Tracked"
            isPositive={true}
            subtitle="across 8 categories"
            icon={Package}
            onClick={() => router.push('/products')}
          />
          <StatCard
            title={t('inventoryValue')}
            value="₹35.2L"
            change="84.2%"
            isPositive={null}
            subtitle="catalog turnover health"
            icon={Layers}
            onClick={() => router.push('/inventory')}
          />
          <StatCard
            title="Sales Growth %"
            value="+14.2%"
            change="Q3 on track"
            isPositive={true}
            subtitle="beating 12% benchmark"
            icon={Award}
            onClick={() => router.push('/analytics')}
          />
          <StatCard
            title="Average Order Value"
            value="₹506"
            change="+₹42"
            isPositive={true}
            subtitle="bundle discount uplift"
            icon={Zap}
            onClick={() => router.push('/sales')}
          />
        </div>
      </div>

      {/* Prominent High-Risk Urgent AI Action Banner */}
      <div className="p-5 rounded-2xl border-2 border-rose-500/40 bg-gradient-to-br from-rose-50/70 via-white to-rose-50/30 dark:from-rose-950/30 dark:via-slate-900 dark:to-slate-900/60 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl overflow-hidden border border-rose-200 dark:border-rose-800 shadow-md flex-shrink-0 mt-0.5">
            <img src={criticalProduct.image} alt={criticalProduct.name} className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="danger" size="sm">
                CRITICAL STOCKOUT IMMINENT
              </Badge>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                SKU: {criticalProduct.sku}
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1">
              {t(criticalProduct.name)} expected to stock out in 1.3 days (+24% velocity surge).
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
              Current stock: <strong>{criticalProduct.stock} units</strong> | Daily sales: <strong>{criticalProduct.dailyVelocity} units/day</strong>. Recommended replenishment: <strong>{criticalProduct.suggestedReorder} units</strong>.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            icon={Eye}
            onClick={() => handleOpenAnalysis(criticalProduct)}
          >
            {t('viewAnalysis')}
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={ShoppingCart}
            onClick={() => handleCreatePO(criticalProduct)}
          >
            {t('createPO')} ({criticalProduct.suggestedReorder} Units)
          </Button>
        </div>
      </div>

      {/* Best-Selling Products Section */}
      <BestSellingProducts
        products={products}
        onViewAll={() => router.push('/products')}
      />

      {/* Top Customers & Star Sellers Leaderboards (2 Columns) */}
      <div className="grid grid-cols-1 gap-6">
        <TopCustomersLeaderboard
          customers={customers}
          onViewAll={() => router.push('/customers')}
        />
        <StarSellersLeaderboard
          employees={employees}
          onViewAll={() => router.push('/employees')}
        />
      </div>

      {/* Smart Discount Recommendation System (ID3 & C4.5) */}
      <SmartDiscountSection products={products} />

      {/* Customer Intelligence & K-Means Clusters */}
      <CustomerIntelligenceSection
        clusters={clusters}
        onOpenClusteringModal={() => setIsClusteringModalOpen(true)}
      />

      {/* Middle Section: Sales Trend & Inventory Health Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Performance Chart (2 Cols) */}
        <div className="lg:col-span-2 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {t('salesPerformance')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Monthly revenue benchmarked against algorithmic sales targets
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => router.push('/analytics')}>
              {t('fullAnalytics')} <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
          <SalesChart />
        </div>

        {/* Inventory Health Status (1 Col) */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {t('inventoryHealth')}
              </h3>
              <Badge variant="warning" size="sm">
                {t('actionRequired')}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Real-time multi-store stock level distributions
            </p>
            <InventoryChart healthyCount={32} lowStockCount={11} criticalCount={5} />
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => router.push('/inventory')}
            >
              {t('inspectRiskMatrix')} <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        </div>
      </div>

      {/* Contextual AI Insights Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            {t('aiInsights')}
          </h3>
          <span className="text-xs text-slate-400">{t('automatedDiagnostics')}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            onClick={() => handleOpenAnalysis(criticalProduct)}
            className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-400 transition-all cursor-pointer shadow-xs space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <Badge variant="danger" size="sm">
                Stockout Risk (92%)
              </Badge>
              <Eye className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500" />
            </div>
            <div className="font-bold text-xs text-slate-900 dark:text-slate-100">
              Farm Fresh Milk 1L
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Daily consumption jumped to 18.5 units. Depletion projected in 31 hours.
            </p>
          </div>

          <div
            onClick={() => router.push('/forecasting')}
            className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-400 transition-all cursor-pointer shadow-xs space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <Badge variant="warning" size="sm">
                Demand Spike (+45%)
              </Badge>
              <TrendingUp className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500" />
            </div>
            <div className="font-bold text-xs text-slate-900 dark:text-slate-100">
              Arabica Coffee Beans (1kg)
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Repeat cohort replenishment velocity accelerated across Chennai & Bangalore.
            </p>
          </div>

          <div
            onClick={() => router.push('/stores')}
            className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-400 transition-all cursor-pointer shadow-xs space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <Badge variant="info" size="sm">
                Store 12 Revenue Drop (-8%)
              </Badge>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500" />
            </div>
            <div className="font-bold text-xs text-slate-900 dark:text-slate-100">
              Bandra Central Store
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Revenue drop directly correlates to out-of-stock top dairy items for 3 days.
            </p>
          </div>

          <div
            onClick={() => router.push('/customers')}
            className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-400 transition-all cursor-pointer shadow-xs space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <Badge variant="purple" size="sm">
                High-Value VIPs (142)
              </Badge>
              <Users className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500" />
            </div>
            <div className="font-bold text-xs text-slate-900 dark:text-slate-100">
              K-Means Cluster 1 Champions
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Top 18% of customers account for 48% of total gross profit. Ready for VIP preview.
            </p>
          </div>
        </div>
      </div>

      {/* Product Intelligence Modal */}
      <ProductIntelligenceModal
        product={selectedProduct}
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false);
          setSelectedProduct(null);
        }}
        onCreatePO={(prod) => handleCreatePO(prod)}
      />

      {/* K-Means Customer Clustering Modal */}
      <CustomerClusteringModal
        isOpen={isClusteringModalOpen}
        onClose={() => setIsClusteringModalOpen(false)}
        onClusteringComplete={(newClusters) => setClusters(newClusters)}
      />
    </div>
  );
}
