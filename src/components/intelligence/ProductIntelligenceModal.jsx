'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  ShoppingCart,
  ShieldCheck,
  Store,
  User,
  Tag,
  Cpu,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { ForecastChart } from '@/components/charts/ForecastChart';

export function ProductIntelligenceModal({ product, isOpen, onClose, onCreatePO, onApplyDiscount }) {
  if (!product) return null;

  const discountInfo = product.smartDiscount || {
    recommended: 15,
    model: 'C4.5',
    confidence: 87,
    reason: 'Inventory is above expected demand and sales velocity is declining. A 15% discount is recommended to improve product movement.',
    factors: ['High inventory', 'Declining demand', 'Approaching expiry'],
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${product.name} — AI Diagnostics & Product Intelligence`}
      subtitle={`SKU: ${product.sku} | Brand: ${product.brand} | Supplier: ${product.supplier}`}
      maxWidth="max-w-4xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <ShieldCheck className="w-4 h-4 text-indigo-500" />
            <span>ARIMA Multi-Horizon Predictive Confidence: 94%</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={ShoppingCart}
              onClick={() => {
                onClose();
                if (onCreatePO) onCreatePO(product);
              }}
            >
              Create Purchase Order ({product.suggestedReorder || 40} Units)
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Product Overview Header with Photo, Seller and Store Assignment */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-3xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-4">
            <img
              src={product.image || 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=400&q=80'}
              alt={product.name}
              className="w-16 h-16 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 flex-shrink-0 shadow-sm"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">{product.sku}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                  {product.category}
                </span>
              </div>
              <h3 className="text-base font-black text-slate-900 dark:text-slate-100 truncate mt-0.5">
                {product.name}
              </h3>
              <p className="text-xs text-slate-400">
                Brand: {product.brand} • Supplier: {product.supplier} • {product.unit}
              </p>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs space-y-1 sm:min-w-64">
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
              <span className="flex items-center gap-1.5 text-slate-400 font-semibold">
                <Store className="w-3.5 h-3.5 text-indigo-500" /> Primary Store:
              </span>
              <strong className="text-slate-900 dark:text-slate-100">{product.store || 'Indiranagar Flagship'}</strong>
            </div>
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
              <span className="flex items-center gap-1.5 text-slate-400 font-semibold">
                <User className="w-3.5 h-3.5 text-purple-500" /> Responsible Seller:
              </span>
              <strong className="text-purple-600 dark:text-purple-400">{product.seller || 'Priya Sharma'}</strong>
            </div>
          </div>
        </div>

        {/* Multi-Store Inventory & Demand Allocation */}
        {product.storeAssignments && product.storeAssignments.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-indigo-600" /> Multi-Store Inventory & Seller Distribution
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {product.storeAssignments.map((st, i) => (
                <div
                  key={i}
                  className="p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-slate-100 truncate">{st.storeName}</span>
                    <Badge variant={st.stockStatus === 'Low Stock' ? 'danger' : 'success'} size="sm">
                      {st.stock} in stock
                    </Badge>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Seller: <strong className="text-slate-700 dark:text-slate-300">{st.sellerName}</strong> • Velocity: <strong>{st.dailyVelocity}/d</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Metric Cards Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Current Stock
            </span>
            <div className="text-xl font-black text-slate-900 dark:text-slate-100 mt-1">
              {product.stock} {product.unit}
            </div>
            <div className="mt-1">
              <Badge variant={product.stock <= product.reorderLevel ? 'danger' : 'success'} size="sm">
                {product.stockStatus || 'Healthy'}
              </Badge>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Daily Velocity
            </span>
            <div className="text-xl font-black text-slate-900 dark:text-slate-100 mt-1">
              {product.dailyVelocity} /day
            </div>
            <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> {product.velocityChange}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Stockout Risk
            </span>
            <div className="text-xl font-black text-rose-600 dark:text-rose-400 mt-1">
              {product.stockoutRisk || 87}%
            </div>
            <div className="text-xs text-rose-500 font-semibold mt-1">
              Runway: {product.expectedStockoutDays || 3} Days
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Unit Economics
            </span>
            <div className="text-xl font-black text-slate-900 dark:text-slate-100 mt-1">
              ₹{product.price}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Margin: {Math.round(((product.price - product.costPrice) / product.price) * 100)}% (Cost: ₹{product.costPrice})
            </div>
          </div>
        </div>

        {/* Smart Discount Recommendation Box */}
        <div className="p-4 rounded-2xl bg-purple-50/80 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/60 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-purple-600 text-white flex-shrink-0">
              <Tag className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-purple-900 dark:text-purple-200">
                  Smart Discount Model ({discountInfo.model || 'C4.5'})
                </h4>
                <Badge variant={discountInfo.recommended > 0 ? 'purple' : 'neutral'} size="sm">
                  {discountInfo.recommended > 0 ? `${discountInfo.recommended}% Recommended` : 'No Markdown Required'}
                </Badge>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">
                {discountInfo.reason}
              </p>
            </div>
          </div>
        </div>

        {/* AI Insight banner */}
        <div className="p-4 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 flex items-start gap-3">
          <div className="p-2 rounded-xl bg-indigo-600 text-white flex-shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
              RetailMind Automated Diagnostic
            </h4>
            <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">
              {product.aiInsight ||
                `Demand has surged by ${product.velocityChange} over the last 14 days. Current inventory (${product.stock} units) will deplete within ${product.expectedStockoutDays || 3} days. Recommend immediately ordering ${product.suggestedReorder || 40} units.`}
            </p>
          </div>
        </div>

        {/* Demand Forecast Chart */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
            Multi-Horizon Demand Forecast (Historical Actuals vs AI ML Prediction)
          </h4>
          <ForecastChart
            series={
              product.forecastTrend && product.forecastTrend.length > 3
                ? product.forecastTrend
                : [
                    { label: 'Day -14', actual: 4.2, forecast: 4.0, lower: 3.5, upper: 4.8 },
                    { label: 'Day -7', actual: 5.1, forecast: 5.0, lower: 4.4, upper: 5.6 },
                    { label: 'Today', actual: product.dailyVelocity || 6.4, forecast: product.dailyVelocity || 6.4, lower: 5.6, upper: 7.2 },
                    { label: '+3d', actual: null, forecast: 7.2, lower: 6.0, upper: 8.4 },
                    { label: '+7d', actual: null, forecast: 7.8, lower: 6.5, upper: 9.1 },
                    { label: '+14d', actual: null, forecast: 8.5, lower: 7.0, upper: 10.0 },
                    { label: '+30d', actual: null, forecast: 9.2, lower: 7.5, upper: 10.9 },
                  ]
            }
            height={180}
          />
        </div>
      </div>
    </Modal>
  );
}
