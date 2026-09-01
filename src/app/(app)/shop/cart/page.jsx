'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  Tag,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  MapPin,
  CreditCard,
  QrCode,
  Banknote,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Badge } from '@/components/common/Badge';

export default function ShopCartPage() {
  const router = useRouter();
  const {
    cart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    cartTotal,
    cartSavings,
    cartItemCount,
    placeCustomerOrder,
    user,
  } = useAuth();

  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState(
    'Flat 402, Palm Heights, 12th Main, Indiranagar, Bangalore - 560038'
  );
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const deliveryFee = cartTotal >= 499 || cartItemCount === 0 ? 0 : 40;
  const grandTotal = Math.max(0, cartTotal - couponDiscount + deliveryFee);

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    setCouponError('');
    const code = couponCode.trim().toUpperCase();

    if (code === 'FRESH10') {
      const disc = Math.round(cartTotal * 0.1);
      setCouponDiscount(disc);
      setAppliedCoupon('FRESH10 (10% Off)');
      setCouponCode('');
    } else if (code === 'RETAILMIND') {
      const disc = Math.min(150, Math.round(cartTotal * 0.15));
      setCouponDiscount(disc);
      setAppliedCoupon('RETAILMIND (₹150 Supermarket Credit)');
      setCouponCode('');
    } else {
      setCouponError('Invalid coupon code. Try FRESH10 or RETAILMIND.');
    }
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    setIsCheckingOut(true);

    setTimeout(() => {
      const createdOrder = placeCustomerOrder({
        totalAmount: grandTotal,
        store: user?.store || 'Indiranagar Flagship (Store 01)',
        paymentMethod: paymentMethod === 'UPI' ? 'UPI (Google Pay / PhonePe)' : paymentMethod === 'Card' ? 'Credit Card (Visa / Master)' : 'Cash on Delivery',
        deliveryAddress: deliveryAddress,
      });
      setIsCheckingOut(false);
      router.push('/shop/orders');
    }, 800);
  };

  return (
    <div className="space-y-8 pb-16 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <ShoppingBag className="w-6 h-6 text-emerald-600" />
          My Supermarket Basket
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Review your items, apply promotional discount vouchers, and choose delivery options.
        </p>
      </div>

      {cart.length === 0 ? (
        <div className="p-16 text-center rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-500 mx-auto flex items-center justify-center">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-black text-slate-900 dark:text-slate-100">
              Your shopping basket is empty
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Add fresh produce, dairy, artisanal bread, and snacks from the supermarket catalog!
            </p>
          </div>
          <Link href="/shop/products">
            <Button variant="primary" size="md" className="bg-emerald-600 hover:bg-emerald-700 font-bold mt-2">
              Start Supermarket Shopping
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Cols: Cart Items List & Delivery Address */}
          <div className="lg:col-span-2 space-y-6">
            <div className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="font-black text-sm text-slate-900 dark:text-slate-100">
                  Cart Items ({cartItemCount})
                </span>
                <button
                  onClick={clearCart}
                  className="text-xs text-rose-500 hover:text-rose-600 font-semibold cursor-pointer"
                >
                  Clear Cart
                </button>
              </div>

              <div className="space-y-3 divide-y divide-slate-100 dark:divide-slate-800">
                {cart.map((item) => (
                  <div key={item.id} className="pt-3 first:pt-0 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-14 h-14 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 truncate">
                          {item.name}
                        </h4>
                        <div className="text-xs text-slate-400 mt-0.5 font-mono">
                          ₹{item.price} / {item.unit}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 flex-shrink-0">
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 px-2 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                          className="p-1 text-slate-600 dark:text-slate-300 hover:text-emerald-600 cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-black text-xs min-w-4 text-center">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                          className="p-1 text-slate-600 dark:text-slate-300 hover:text-emerald-600 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Total Item Price */}
                      <div className="text-right min-w-16">
                        <div className="font-black text-sm text-slate-900 dark:text-slate-100">
                          ₹{(item.price * item.quantity).toLocaleString()}
                        </div>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Address & Payment Choice */}
            <div className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600" />
                Delivery Address
              </h3>

              <textarea
                rows={2}
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                className="w-full px-3.5 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                placeholder="Enter complete delivery street, flat, and pincode..."
              />

              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                  Select Payment Option
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'UPI', label: 'Instant UPI', icon: QrCode },
                    { id: 'Card', label: 'Credit / Debit', icon: CreditCard },
                    { id: 'COD', label: 'Cash on Delivery', icon: Banknote },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id)}
                      className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                        paymentMethod === m.id
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      <m.icon className="w-4 h-4" />
                      <span>{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right 1 Col: Bill Summary & Checkout */}
          <div className="space-y-6">
            {/* Promo Code Box */}
            <div className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-emerald-600" /> Apply Coupon Voucher
              </h4>

              {appliedCoupon ? (
                <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center justify-between">
                  <span>{appliedCoupon}</span>
                  <button
                    onClick={() => {
                      setAppliedCoupon('');
                      setCouponDiscount(0);
                    }}
                    className="text-rose-500 font-bold hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter FRESH10 / RETAILMIND"
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 uppercase focus:outline-none"
                  />
                  <Button type="submit" variant="outline" size="sm">
                    Apply
                  </Button>
                </form>
              )}

              {couponError && (
                <p className="text-[11px] text-rose-500 font-medium">{couponError}</p>
              )}
            </div>

            {/* Price Breakdown */}
            <div className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
              <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                Order Bill Summary
              </h4>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span>Basket Subtotal</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">₹{cartTotal.toLocaleString()}</span>
                </div>

                {cartSavings > 0 && (
                  <div className="flex items-center justify-between text-emerald-600 font-bold">
                    <span>Direct Product Savings</span>
                    <span>-₹{cartSavings.toLocaleString()}</span>
                  </div>
                )}

                {couponDiscount > 0 && (
                  <div className="flex items-center justify-between text-emerald-600 font-bold">
                    <span>Coupon Voucher Discount</span>
                    <span>-₹{couponDiscount.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span>Express Delivery Fee</span>
                  <span>{deliveryFee === 0 ? <strong className="text-emerald-600 font-bold">FREE</strong> : `₹${deliveryFee}`}</span>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-base font-black text-slate-900 dark:text-slate-100">
                  <span>Grand Total</span>
                  <span className="text-emerald-600 text-xl font-black">
                    ₹{grandTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              <Button
                variant="primary"
                size="lg"
                onClick={handleCheckout}
                loading={isCheckingOut}
                icon={ArrowRight}
                iconPosition="right"
                className="w-full bg-emerald-600 hover:bg-emerald-700 font-bold shadow-lg shadow-emerald-600/30 cursor-pointer"
              >
                Place Order (₹{grandTotal.toLocaleString()})
              </Button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 font-semibold text-center">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>100% Safe & Contactless Supermarket Delivery</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
