'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Package,
  Clock,
  CheckCircle2,
  Truck,
  RotateCcw,
  Receipt,
  MapPin,
  ShoppingBag,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';

export default function ShopOrdersPage() {
  const { customerOrders, addToCart } = useAuth();
  const [reorderedId, setReorderedId] = useState('');

  const handleReorder = (order) => {
    order.items?.forEach((item) => {
      addToCart(
        {
          id: `reorder-${item.name.slice(0, 4)}`,
          name: item.name,
          price: item.price,
          originalPrice: Math.round(item.price * 1.15),
          image: item.image || 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80',
          unit: 'Unit',
        },
        item.qty || 1
      );
    });
    setReorderedId(order.id);
    setTimeout(() => setReorderedId(''), 3000);
  };

  return (
    <div className="space-y-6 pb-16 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Package className="w-6 h-6 text-emerald-600" />
          My Orders & Delivery Tracking
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          View your past orders, delivery receipts, and re-order essential grocery baskets.
        </p>
      </div>

      {reorderedId && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center justify-between animate-fade-in">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Order items re-added to your shopping basket!
          </span>
          <Link href="/shop/cart" className="underline font-black">
            View Cart →
          </Link>
        </div>
      )}

      {customerOrders.length === 0 ? (
        <div className="p-16 text-center rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-500 mx-auto flex items-center justify-center">
            <Package className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-black text-slate-900 dark:text-slate-100">
              No orders placed yet
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Place your first fresh grocery order and track its live delivery status here!
            </p>
          </div>
          <Link href="/shop/products">
            <Button variant="primary" size="md" className="bg-emerald-600 hover:bg-emerald-700 font-bold mt-2">
              Start Supermarket Shopping
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {customerOrders.map((order) => {
            const isProcessing = order.status === 'Processing';
            return (
              <div
                key={order.id}
                className="p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4 hover:border-emerald-300 transition-all"
              >
                {/* Order Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-sm text-slate-900 dark:text-slate-100">
                        {order.id}
                      </span>
                      <Badge variant={isProcessing ? 'warning' : 'success'} size="sm" dot>
                        {order.status || 'Delivered'}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Placed on: <strong>{order.date}</strong> • From: <strong>{order.store}</strong>
                    </p>
                  </div>

                  <div className="text-right flex items-center gap-3 sm:block">
                    <span className="text-xs text-slate-400 block sm:inline">Total Amount: </span>
                    <span className="text-lg font-black text-slate-900 dark:text-slate-100">
                      ₹{order.totalAmount?.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Items List */}
                <div className="space-y-2.5">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Ordered Groceries ({order.items?.length || order.itemCount} items)
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {order.items?.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center gap-3"
                      >
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700 flex-shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center font-bold text-xs">
                            🛒
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <h5 className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">
                            {item.name}
                          </h5>
                          <div className="text-[11px] text-slate-400">
                            Qty: <strong>{item.qty || 1}</strong> • ₹{item.price}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Footer & Reorder Action */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span className="truncate">{order.deliveryAddress || 'Indiranagar Flagship, Bangalore'}</span>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      icon={RotateCcw}
                      onClick={() => handleReorder(order)}
                      className="font-bold text-xs"
                    >
                      Reorder Basket
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
