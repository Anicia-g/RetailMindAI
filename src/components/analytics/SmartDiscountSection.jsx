'use client';

import React, { useState } from 'react';
import { Tag, Sparkles, Cpu, CheckCircle2, Sliders, ArrowRight, Layers, AlertCircle } from 'lucide-react';
import { useAppSettings } from '@/context/AppSettingsContext';
import { Button } from '@/components/common/Button';

export function SmartDiscountSection({ products }) {
  const { t } = useAppSettings();
  const [selectedModel, setSelectedModel] = useState('C4.5'); // 'ID3' | 'C4.5'
  const [activeProductSku, setActiveProductSku] = useState('DAIRY-302'); // Yogurt

  // Pick top candidate products with diverse discount conditions
  const candidateProducts = products.filter(
    (p) => ['DAIRY-302', 'MILK-001', 'BAK-102', 'BEV-882', 'FRU-201', 'LIF-551'].includes(p.sku)
  );

  const activeProduct =
    candidateProducts.find((p) => p.sku === activeProductSku) || candidateProducts[0] || products[0];

  const modelAccuracy = selectedModel === 'C4.5' ? '91.4% (Gain Ratio)' : '87.8% (Information Gain)';

  return (
    <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
            <Tag className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              🏷️ Smart Discount Recommendation Engine
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-semibold">
                Decision Tree ML
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Evaluates inventory runway, demand elasticity, shelf-life expiry, and margin to prescribe optimal discount %
            </p>
          </div>
        </div>

        {/* Algorithm Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setSelectedModel('ID3')}
            className={`px-3 py-1 text-xs rounded-lg font-bold transition-all cursor-pointer ${
              selectedModel === 'ID3'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            ID3 (Info Gain)
          </button>
          <button
            type="button"
            onClick={() => setSelectedModel('C4.5')}
            className={`px-3 py-1 text-xs rounded-lg font-bold transition-all cursor-pointer ${
              selectedModel === 'C4.5'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            C4.5 (Gain Ratio)
          </button>
        </div>
      </div>

      {/* Main Interactive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-1">
        {/* Left: Product Selector Tabs */}
        <div className="space-y-2 lg:border-r lg:border-slate-100 lg:dark:border-slate-800 lg:pr-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Evaluate Product Case:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-1.5">
            {candidateProducts.map((p) => (
              <button
                key={p.sku}
                type="button"
                onClick={() => setActiveProductSku(p.sku)}
                className={`w-full p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                  activeProductSku === p.sku
                    ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/40 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-slate-300'
                }`}
              >
                <img
                  src={p.image}
                  alt={p.name}
                  className="w-8 h-8 rounded-lg object-cover flex-shrink-0 border border-slate-200 dark:border-slate-700"
                />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                    {t(p.name)}
                  </div>
                  <div className="text-[10px] text-slate-400 flex items-center justify-between">
                    <span>{p.sku}</span>
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                      {p.smartDiscount?.recommended || 0}% Off
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Center & Right: Model Decision Output (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Output Hero Banner */}
          <div className="p-4 rounded-xl border-2 border-emerald-500/40 bg-gradient-to-r from-emerald-50/50 via-white to-emerald-50/20 dark:from-emerald-950/20 dark:via-slate-900 dark:to-slate-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <img
                src={activeProduct.image}
                alt={activeProduct.name}
                className="w-14 h-14 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shadow-sm flex-shrink-0 mt-0.5"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 font-mono">
                    {activeProduct.sku}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    Model: {selectedModel}
                  </span>
                </div>
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 mt-0.5">
                  {t(activeProduct.name)}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                  <strong>Recommendation Rationale:</strong> {activeProduct.smartDiscount?.reason}
                </p>
              </div>
            </div>

            {/* Big Recommended Discount Badge */}
            <div className="flex-shrink-0 text-center sm:text-right bg-white dark:bg-slate-800 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800/60 shadow-xs">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Recommended Discount
              </div>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                {activeProduct.smartDiscount?.recommended === 0
                  ? 'NO DISCOUNT (0%)'
                  : `${activeProduct.smartDiscount?.recommended}% OFF`}
              </div>
              <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                Confidence: <strong className="text-slate-800 dark:text-slate-200">{activeProduct.smartDiscount?.confidence}%</strong>
              </div>
            </div>
          </div>

          {/* Model Decision Attributes Breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Current Stock</span>
              <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                {activeProduct.stock} {activeProduct.unit}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Daily Velocity</span>
              <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                {activeProduct.dailyVelocity}/day ({activeProduct.velocityChange})
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Days to Expiry</span>
              <span className={`text-xs font-black ${
                activeProduct.expiryDays <= 5 ? 'text-rose-600' : 'text-slate-800 dark:text-slate-200'
              }`}>
                {activeProduct.expiryDays} Days
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Model Accuracy</span>
              <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">
                {modelAccuracy}
              </span>
            </div>
          </div>

          {/* Key Feature Split Factors */}
          <div className="p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs flex flex-wrap items-center gap-2">
            <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5 text-indigo-500" />
              Primary Decision Factors:
            </span>
            {activeProduct.smartDiscount?.factors?.map((f, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium"
              >
                {f}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
