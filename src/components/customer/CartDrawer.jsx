'use client';

import React, { useState } from 'react';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useAppSettings } from '@/context/AppSettingsContext';
import { Button } from '@/components/common/Button';

export function CartDrawer({ isOpen, onClose }) {
  const { cart, removeFromCart, updateCartQuantity, clearCart, cartTotal, cartSavings, cartItemCount } = useAuth();
  const { t } = useAppSettings();
  const [checkedOut, setCheckedOut] = useState(false);

  if (!isOpen) return null;

  const handleCheckout = () => {
    setCheckedOut(true);
    setTimeout(() => {
      clearCart();
      setCheckedOut(false);
      onClose();
    }, 1600);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col justify-between animate-fade-in">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-slate-100">
                  {t('shoppingCart')}
                </h3>
                <span className="text-xs text-slate-400">
                  {cartItemCount} {cartItemCount === 1 ? 'item' : 'items'}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {checkedOut ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3 animate-fade-in">
                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-lg">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Order Placed Successfully!
                </h4>
                <p className="text-xs text-slate-500 max-w-xs">
                  Your fresh supermarket items are being packaged for priority delivery.
                </p>
              </div>
            ) : cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-3">
                <ShoppingBag className="w-12 h-12 opacity-30" />
                <div className="text-sm font-bold text-slate-600 dark:text-slate-300">{t('emptyCartTitle')}</div>
                <p className="text-xs text-slate-400 max-w-xs">
                  {t('emptyCartDesc')}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Savings Banner */}
                {cartSavings > 0 && (
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between text-xs font-bold text-emerald-800 dark:text-emerald-300">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      Smart Supermarket Discount Applied:
                    </span>
                    <span>Save ₹{cartSavings.toFixed(0)}</span>
                  </div>
                )}

                {/* Cart Items List */}
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 flex items-center justify-between gap-3 shadow-2xs"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-14 h-14 rounded-lg object-cover border border-slate-200 dark:border-slate-700 flex-shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">
                        {t(item.name)}
                      </h4>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <span className="font-bold text-slate-800 dark:text-slate-200">₹{item.price}</span>
                        {item.originalPrice > item.price && (
                          <span className="line-through text-slate-400 text-[10px]">₹{item.originalPrice}</span>
                        )}
                        <span>• {item.unit || 'unit'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-800">
                        <button
                          onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                          className="p-1 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2 text-xs font-black text-slate-900 dark:text-slate-100">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                          className="p-1 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer & Checkout */}
          {cart.length > 0 && !checkedOut && (
            <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/80 space-y-3">
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                  <span>Subtotal:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    ₹{(cartTotal + cartSavings).toFixed(0)}
                  </span>
                </div>

                {cartSavings > 0 && (
                  <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                    <span>Discount Savings:</span>
                    <span>-₹{cartSavings.toFixed(0)}</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm pt-2 border-t border-slate-200 dark:border-slate-800">
                  <span className="font-bold text-slate-900 dark:text-slate-100">Order Total:</span>
                  <span className="font-black text-base text-slate-900 dark:text-slate-100">
                    ₹{cartTotal.toFixed(0)}
                  </span>
                </div>
              </div>

              <Button
                variant="primary"
                size="lg"
                className="w-full shadow-lg shadow-indigo-600/30 font-bold cursor-pointer"
                icon={ArrowRight}
                iconPosition="right"
                onClick={handleCheckout}
              >
                {t('proceedToCheckout')} (₹{cartTotal.toFixed(0)})
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
