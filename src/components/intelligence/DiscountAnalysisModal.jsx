'use client';

import React, { useState } from 'react';
import {
  Tag,
  Sparkles,
  TrendingDown,
  Clock,
  Check,
  Cpu,
  BarChart3,
  Percent,
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { discountService } from '@/services/discountService';

export function DiscountAnalysisModal({
  product,
  isOpen,
  onClose,
  onDiscountApplied,
}) {
  if (!product) return null;

  const discountInfo = product.smartDiscount || {
    recommended: 15,
    model: 'C4.5',
    confidence: 87,
    reason: 'Inventory is above expected demand and sales velocity is declining. A 15% discount is recommended to accelerate movement.',
    factors: ['High inventory (145 units)', 'Declining demand (-22%)', 'Approaching expiry (5 days)'],
    expectedEffect: 'Accelerates sell-through to 18 units/day, preventing ₹11,200 potential expiry loss.',
    previousPerformance: [
      { discount: 0, velocity: 10.0, margin: 40.6 },
      { discount: 5, velocity: 12.0, margin: 36.8 },
      { discount: 10, velocity: 14.0, margin: 33.1 },
      { discount: 15, velocity: 18.0, margin: 29.4 },
      { discount: 20, velocity: 19.0, margin: 25.6 },
    ],
  };

  const [selectedDiscount, setSelectedDiscount] = useState(discountInfo.recommended);
  const [customDiscount, setCustomDiscount] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const previousPerformance = discountInfo.previousPerformance || [
    { discount: 0, velocity: 10.0, margin: 40.6 },
    { discount: 5, velocity: 12.0, margin: 36.8 },
    { discount: 10, velocity: 14.0, margin: 33.1 },
    { discount: 15, velocity: 18.0, margin: 29.4 },
    { discount: 20, velocity: 19.0, margin: 25.6 },
  ];

  const handleApply = async () => {
    const finalPct = selectedDiscount === 'custom' ? Number(customDiscount) || 0 : selectedDiscount;
    setIsApplying(true);

    const res = await discountService.applyDiscount(product.id, finalPct);
    setIsApplying(false);
    setSuccessMessage(`${finalPct}% discount applied to ${product.name}!`);

    if (onDiscountApplied) {
      onDiscountApplied(product, finalPct);
    }

    setTimeout(() => {
      setSuccessMessage('');
      onClose();
    }, 1200);
  };

  const basePrice = product.originalPrice || product.price;
  const currentDiscountedPrice =
    selectedDiscount === 'custom'
      ? Math.round(basePrice * (1 - (Number(customDiscount) || 0) / 100))
      : Math.round(basePrice * (1 - selectedDiscount / 100));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Smart Discount Intelligence Analysis"
      subtitle={`AI-Driven Markdown Optimization for ${product.name}`}
      maxWidth="max-w-3xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Cpu className="w-4 h-4 text-purple-600" />
            <span>Algorithm: <strong>{discountInfo.model || 'C4.5'} Decision Tree</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              loading={isApplying}
              onClick={handleApply}
              className="bg-purple-600 hover:bg-purple-700 font-bold shadow-md shadow-purple-600/30"
            >
              Apply {selectedDiscount === 'custom' ? `${customDiscount}%` : `${selectedDiscount}%`} Discount (₹{currentDiscountedPrice})
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {successMessage && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Product & Store Header */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <img
              src={product.image}
              alt={product.name}
              className="w-16 h-16 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 flex-shrink-0"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{product.category}</span>
                <Badge variant="purple" size="sm">SKU: {product.sku}</Badge>
              </div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 mt-0.5">
                {product.name}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Store: <strong>{product.store || 'Indiranagar Flagship'}</strong> • Assigned Seller: <strong>{product.seller || 'Priya Sharma'}</strong>
              </p>
            </div>
          </div>

          <div className="text-right flex-shrink-0">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Current Selling Price</span>
            <div className="text-xl font-black text-slate-900 dark:text-slate-100">₹{product.price}</div>
            <div className="text-[11px] text-slate-400">Cost: ₹{product.costPrice} (Margin {Math.round(((product.price - product.costPrice) / product.price) * 100)}%)</div>
          </div>
        </div>

        {/* Product Inventory & Demand Pulse */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <span className="text-slate-400 font-bold uppercase text-[10px] block">Current Stock</span>
            <div className="text-lg font-black text-slate-900 dark:text-slate-100 mt-0.5">
              {product.stock} {product.unit}
            </div>
            <span className="text-[10px] text-purple-600 font-semibold">Min: {product.reorderLevel}</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <span className="text-slate-400 font-bold uppercase text-[10px] block">Daily Velocity</span>
            <div className="text-lg font-black text-slate-900 dark:text-slate-100 mt-0.5">
              {product.dailyVelocity} /day
            </div>
            <span className={`text-[10px] font-bold ${product.velocityChange?.startsWith('+') ? 'text-emerald-600' : 'text-rose-600'}`}>
              {product.velocityChange} 14d trend
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <span className="text-slate-400 font-bold uppercase text-[10px] block">Shelf Life Expiry</span>
            <div className="text-lg font-black text-amber-600 mt-0.5">
              {product.expiryDays ? `${product.expiryDays} Days` : '90+ Days'}
            </div>
            <span className="text-[10px] text-amber-600 font-semibold">Clearance Priority</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <span className="text-slate-400 font-bold uppercase text-[10px] block">ML Model Confidence</span>
            <div className="text-lg font-black text-purple-600 mt-0.5">
              {discountInfo.confidence}%
            </div>
            <span className="text-[10px] text-slate-500 font-mono">{discountInfo.model || 'C4.5'} Classifier</span>
          </div>
        </div>

        {/* Model Analysis Rationale Card */}
        <div className="p-4 rounded-2xl bg-purple-50/80 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/60 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <h4 className="text-xs font-black uppercase tracking-wider text-purple-900 dark:text-purple-200">
                Decision Tree Classification Analysis ({discountInfo.model || 'C4.5'})
              </h4>
            </div>
            <Badge variant="purple" size="sm">
              Recommended: {discountInfo.recommended}% OFF
            </Badge>
          </div>

          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            {discountInfo.reason}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase text-purple-800 dark:text-purple-300">Decision Factors:</span>
              <ul className="space-y-1">
                {discountInfo.factors?.map((f, i) => (
                  <li key={i} className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5 text-[11px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-600" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-2.5 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-purple-100 dark:border-purple-900/40 space-y-1">
              <span className="text-[10px] font-bold uppercase text-purple-800 dark:text-purple-300">Expected Business Outcome:</span>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                {discountInfo.expectedEffect || 'Accelerate stock sell-through while preserving unit margin.'}
              </p>
            </div>
          </div>
        </div>

        {/* Previous Discount Performance Curve */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-purple-600" />
              Historical Discount Elasticity & Sales Velocity
            </h4>
            <span className="text-[11px] text-slate-400">Optimal Sweetspot: 15%</span>
          </div>

          <div className="grid grid-cols-5 gap-2 text-center">
            {previousPerformance.map((p) => {
              const isRec = p.discount === discountInfo.recommended;
              return (
                <div
                  key={p.discount}
                  className={`p-3 rounded-2xl border transition-all ${
                    isRec
                      ? 'bg-purple-100 dark:bg-purple-950/80 border-purple-400 shadow-xs ring-1 ring-purple-400'
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <span className={`text-xs font-black block ${isRec ? 'text-purple-900 dark:text-purple-200' : 'text-slate-700 dark:text-slate-300'}`}>
                    {p.discount}% OFF
                  </span>
                  <div className="text-sm font-black text-slate-900 dark:text-slate-100 mt-1">
                    {p.velocity}/day
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Margin: {p.margin}%
                  </div>
                  {isRec && (
                    <span className="mt-1 inline-block px-1.5 py-0.2 rounded bg-purple-600 text-white text-[9px] font-black uppercase">
                      Recommended
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Discount Selector Options */}
        <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
            Select Discount to Apply to Store Catalog
          </label>

          <div className="flex items-center gap-2 flex-wrap">
            {[0, 5, 10, 15, 20].map((pct) => (
              <button
                key={pct}
                type="button"
                onClick={() => setSelectedDiscount(pct)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                  selectedDiscount === pct
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 ring-2 ring-purple-400'
                    : pct === discountInfo.recommended
                    ? 'bg-purple-50 dark:bg-purple-950/60 border border-purple-300 text-purple-700 dark:text-purple-300'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {pct}% {pct === discountInfo.recommended && '★ Recommended'}
              </button>
            ))}

            <button
              type="button"
              onClick={() => setSelectedDiscount('custom')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                selectedDiscount === 'custom'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              Custom %
            </button>

            {selectedDiscount === 'custom' && (
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min="0"
                  max="90"
                  value={customDiscount}
                  onChange={(e) => setCustomDiscount(e.target.value)}
                  placeholder="e.g. 12"
                  className="w-20 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-center focus:outline-none"
                />
                <span className="text-xs font-bold text-slate-500">%</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
