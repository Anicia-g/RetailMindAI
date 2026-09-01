'use client';

import React, { useState } from 'react';
import {
  TrendingUp,
  Sparkles,
  Calendar,
  ShieldCheck,
  ShoppingCart,
  Clock,
  ArrowRight,
  AlertTriangle
} from 'lucide-react';
import { useAppSettings } from '@/context/AppSettingsContext';
import { StatCard } from '@/components/common/StatCard';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { ForecastChart } from '@/components/charts/ForecastChart';
import { initialForecasts } from '@/data/forecasting';
import { initialProducts } from '@/data/products';

export default function ForecastingPage() {
  const { t } = useAppSettings();

  const [horizon, setHorizon] = useState('7d'); // '7d' | '14d' | '30d'
  const [selectedForecast, setSelectedForecast] = useState(initialForecasts[0]);

  const handleCreatePO = (fc) => {
    const targetProduct = initialProducts.find((p) => p.sku === fc.sku) || {
      id: fc.productId,
      name: fc.productName,
      sku: fc.sku,
      stock: fc.currentStock,
      suggestedReorder: 40,
      costPrice: 1100,
    };
    window.dispatchEvent(new CustomEvent('open-po-modal', { detail: targetProduct }));
  };

  return (
    <div className="space-y-6">
      {/* Header & Horizon selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-slate-100">{t('forecasting')}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Multi-horizon ARIMA + Seasonal Holt-Winters machine learning models with confidence bounds.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">Forecast Horizon:</span>
          {[
            { id: '7d', label: '7 Days' },
            { id: '14d', label: '14 Days' },
            { id: '30d', label: '30 Days' },
          ].map((h) => (
            <button
              key={h.id}
              onClick={() => setHorizon(h.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                horizon === h.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-indigo-400'
              }`}
            >
              {h.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards for Selected Product */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard
          title="Current Velocity"
          value={`${selectedForecast.currentDemandDaily} units/day`}
          change="+32% Acceleration"
          isPositive={true}
          icon={TrendingUp}
        />
        <StatCard
          title={`${horizon.toUpperCase()} Projected Demand`}
          value={`${
            horizon === '7d'
              ? selectedForecast.forecastDemand7d
              : horizon === '14d'
              ? selectedForecast.forecastDemand14d
              : selectedForecast.forecastDemand30d
          } units/day`}
          change="Surge Velocity"
          isPositive={true}
          icon={Sparkles}
        />
        <StatCard
          title="Model Confidence"
          value={selectedForecast.confidenceScore}
          change="Validated ARIMA"
          isPositive={true}
          icon={ShieldCheck}
        />
        <StatCard
          title="Stock Depletion"
          value={selectedForecast.projectedStockoutDate}
          change="Action Required"
          isPositive={false}
          subtitle="based on forecast"
          icon={AlertTriangle}
        />
      </div>

      {/* Main Forecast Chart & Details Card */}
      <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {selectedForecast.productName} ({selectedForecast.sku})
              </h3>
              <Badge variant="purple" size="sm">
                {selectedForecast.forecastModel}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Historical sales velocity benchmarked against algorithmic forecast intervals
            </p>
          </div>

          <Button
            variant="primary"
            size="sm"
            icon={ShoppingCart}
            onClick={() => handleCreatePO(selectedForecast)}
          >
            Create Reorder PO
          </Button>
        </div>

        {/* Time-Series Forecast Chart */}
        <ForecastChart
          series={selectedForecast.timeSeries}
          unit="units/day"
          height={260}
        />

        {/* Recommendation Box */}
        <div className="p-4 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-indigo-600 text-white flex-shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
                RetailMind Automated Procurement Directive
              </h4>
              <p className="text-sm text-slate-700 dark:text-slate-300 mt-1 font-medium leading-relaxed">
                {selectedForecast.reorderRecommendation}
              </p>
            </div>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => handleCreatePO(selectedForecast)}
            className="flex-shrink-0"
          >
            Execute Reorder PO
          </Button>
        </div>
      </div>

      {/* Product Forecast Model Selector List */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3">
          All Predictive SKU Models
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {initialForecasts.map((fc) => (
            <div
              key={fc.productId}
              onClick={() => setSelectedForecast(fc)}
              className={`p-4 rounded-xl border transition-all cursor-pointer shadow-xs space-y-3 ${
                selectedForecast.productId === fc.productId
                  ? 'border-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/20 ring-2 ring-indigo-500/20'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-slate-400">{fc.sku}</span>
                <Badge variant={fc.projectedStockoutDate.includes('Critical') || fc.projectedStockoutDate.includes('Immediate') ? 'danger' : 'warning'} size="sm">
                  {fc.confidenceScore} Conf.
                </Badge>
              </div>

              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{fc.productName}</h4>
                <div className="text-xs text-slate-500 mt-1">
                  Current: <strong>{fc.currentDemandDaily}/day</strong> → Forecast:{' '}
                  <strong className="text-indigo-600 dark:text-indigo-400">{fc.forecastDemand7d}/day</strong>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-rose-500 font-semibold">{fc.projectedStockoutDate}</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-0.5">
                  Select <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
