'use client';

import React, { useState } from 'react';
import { Tag, Sparkles, TrendingDown, Clock, Check, ArrowRight, ShieldCheck, Cpu } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';

export function SmartDiscountCard({
  product,
  onViewAnalysis,
  onApplyDiscount,
}) {
  const [isApplied, setIsApplied] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  if (!product) return null;

  const discountInfo = product.smartDiscount || {
    recommended: 15,
    model: 'C4.5',
    confidence: 87,
    reason: 'Inventory is above expected demand and sales velocity is declining. A 15% discount is recommended to accelerate movement.',
    factors: ['High Inventory', 'Declining Demand', 'Approaching Expiry'],
  };

  const handleApply = () => {
    setIsApplying(true);
    setTimeout(() => {
      setIsApplying(false);
      setIsApplied(true);
      if (onApplyDiscount) {
        onApplyDiscount(product, discountInfo.recommended);
      }
    }, 600);
  };

  return (
    <div className="p-5 rounded-3xl border border-purple-200 dark:border-purple-900/60 bg-gradient-to-b from-purple-50/50 via-white to-purple-50/20 dark:from-purple-950/20 dark:via-slate-900 dark:to-purple-950/10 shadow-sm space-y-4 hover:shadow-md transition-all">
      {/* Top Banner with Model Info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-purple-600 text-white shadow-sm">
            <Tag className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-black text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              Smart Discount Recommendation
            </span>
            <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold flex items-center gap-1">
              <Cpu className="w-3 h-3 inline" /> {discountInfo.model || 'C4.5'} Decision Tree • {discountInfo.confidence || 87}% Confidence
            </span>
          </div>
        </div>

        <Badge variant={discountInfo.recommended > 0 ? 'purple' : 'neutral'} size="md">
          {discountInfo.recommended > 0 ? `${discountInfo.recommended}% RECOMMENDED` : 'NO DISCOUNT'}
        </Badge>
      </div>

      {/* Product Snapshot */}
      <div className="flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-purple-100 dark:border-purple-900/40">
        <img
          src={product.image}
          alt={product.name}
          className="w-14 h-14 rounded-xl object-cover border border-slate-200 dark:border-slate-700 flex-shrink-0"
        />
        <div className="min-w-0 flex-1">
          <div className="text-[10px] uppercase font-bold text-slate-400">{product.category}</div>
          <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 truncate">
            {product.name}
          </h4>
          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
            <span>Price: <strong className="text-slate-900 dark:text-slate-100">₹{product.price}</strong></span>
            <span>•</span>
            <span>Stock: <strong className="text-slate-900 dark:text-slate-100">{product.stock} {product.unit}</strong></span>
            {product.expiryDays && (
              <>
                <span>•</span>
                <span className="text-amber-600 font-semibold flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {product.expiryDays}d left
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Rationale & Factors */}
      <div className="space-y-2 text-xs">
        <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
          "{discountInfo.reason}"
        </p>

        {discountInfo.factors && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {discountInfo.factors.map((f, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded-lg bg-purple-100/70 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-[10px] font-bold"
              >
                ✓ {f}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewAnalysis(product)}
          className="text-xs font-bold"
        >
          View Analysis
        </Button>

        {isApplied ? (
          <div className="px-3.5 py-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-1.5 border border-emerald-300 dark:border-emerald-800">
            <Check className="w-4 h-4" />
            <span>{discountInfo.recommended}% Applied</span>
          </div>
        ) : (
          <Button
            variant="primary"
            size="sm"
            loading={isApplying}
            onClick={handleApply}
            className="bg-purple-600 hover:bg-purple-700 font-bold shadow-md shadow-purple-600/20 text-xs"
          >
            {discountInfo.recommended > 0 ? `Apply ${discountInfo.recommended}% Discount` : 'Acknowledge No Discount'}
          </Button>
        )}
      </div>
    </div>
  );
}
