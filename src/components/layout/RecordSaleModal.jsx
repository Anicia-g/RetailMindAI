'use client';

import React, { useState } from 'react';
import { ShoppingCart, Plus, Trash2, CheckCircle2, User, CreditCard, Banknote, QrCode } from 'lucide-react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { initialProducts } from '@/data/products';

export function RecordSaleModal({ isOpen, onClose, onSaleRecorded }) {
  const [products] = useState(initialProducts);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [cartItems, setCartItems] = useState([
    { productId: products[0].id, quantity: 1 },
  ]);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleAddItem = () => {
    setCartItems([...cartItems, { productId: products[0].id, quantity: 1 }]);
  };

  const handleRemoveItem = (index) => {
    setCartItems(cartItems.filter((_, i) => i !== index));
  };

  const handleProductChange = (index, prodId) => {
    const next = [...cartItems];
    next[index].productId = prodId;
    setCartItems(next);
  };

  const handleQuantityChange = (index, qty) => {
    const next = [...cartItems];
    next[index].quantity = Math.max(1, Number(qty));
    setCartItems(next);
  };

  const calculateTotal = () => {
    return cartItems.reduce((acc, item) => {
      const prod = products.find((p) => p.id === item.productId);
      return acc + (prod ? prod.price * item.quantity : 0);
    }, 0);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const orderItems = cartItems.map((item) => {
      const prod = products.find((p) => p.id === item.productId);
      return {
        name: prod?.name || 'Product',
        sku: prod?.sku || 'SKU',
        qty: item.quantity,
        price: prod?.price || 0,
      };
    });

    const newSale = {
      id: `pos-${Date.now().toString().slice(-4)}`,
      customerName: customerName.trim() || 'Walk-in Customer',
      phone: customerPhone.trim() || '+91 98450 00000',
      date: new Date().toISOString().replace('T', ' ').slice(0, 16),
      itemsCount: cartItems.reduce((acc, i) => acc + i.quantity, 0),
      totalAmount: calculateTotal(),
      status: 'Completed',
      paymentMethod,
      store: 'Indiranagar Flagship (Store 01)',
      items: orderItems,
    };

    setIsSuccess(true);
    setTimeout(() => {
      if (onSaleRecorded) onSaleRecorded(newSale);
      setIsSuccess(false);
      onClose();
      // Reset
      setCustomerName('');
      setCustomerPhone('');
      setCartItems([{ productId: products[0].id, quantity: 1 }]);
    }, 1000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record New Store POS Sale"
      subtitle="Log quick in-store checkout transaction for active shift"
      maxWidth="max-w-xl"
    >
      {isSuccess ? (
        <div className="py-8 text-center space-y-3 animate-fade-in">
          <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-base font-black text-slate-900 dark:text-slate-100">
            Sale Recorded Successfully!
          </h3>
          <p className="text-xs text-slate-500">Receipt generated and stock deducted from store ledger.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Customer Name (Optional)"
              placeholder="e.g. Rahul Sharma"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
            <Input
              label="Customer Phone (Loyalty)"
              placeholder="e.g. +91 98765 43210"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
            />
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
              <span>Items in Cart</span>
              <button
                type="button"
                onClick={handleAddItem}
                className="text-purple-600 hover:text-purple-700 font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Item
              </button>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {cartItems.map((item, idx) => {
                const prod = products.find((p) => p.id === item.productId);
                return (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center gap-2.5"
                  >
                    <div className="flex-1">
                      <select
                        value={item.productId}
                        onChange={(e) => handleProductChange(idx, e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none"
                      >
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} — ₹{p.price} ({p.stock} in store)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="w-20">
                      <input
                        type="number"
                        min="1"
                        max={prod?.stock || 99}
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(idx, e.target.value)}
                        className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-center focus:outline-none"
                      />
                    </div>

                    <div className="w-20 text-right font-black text-xs text-slate-900 dark:text-slate-100">
                      ₹{((prod?.price || 0) * item.quantity).toLocaleString()}
                    </div>

                    {cartItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="p-1 rounded text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                Payment Method
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'UPI', label: 'UPI / QR', icon: QrCode },
                  { id: 'Cash', label: 'Cash', icon: Banknote },
                  { id: 'Card', label: 'Card', icon: CreditCard },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id)}
                    className={`p-2 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      paymentMethod === m.id
                        ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <m.icon className="w-3.5 h-3.5" />
                    <span>{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col justify-between p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/40">
              <span className="text-[11px] font-bold text-purple-700 dark:text-purple-300 uppercase">
                Grand Total Payable
              </span>
              <div className="text-2xl font-black text-purple-900 dark:text-purple-100">
                ₹{calculateTotal().toLocaleString()}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              type="submit"
              icon={ShoppingCart}
              className="bg-purple-600 hover:bg-purple-700 font-bold shadow-md shadow-purple-600/30"
            >
              Complete Sale (₹{calculateTotal().toLocaleString()})
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
