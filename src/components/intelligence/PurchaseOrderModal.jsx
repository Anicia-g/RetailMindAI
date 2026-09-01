'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Trash2, CheckCircle2, Sparkles } from 'lucide-react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { initialSuppliers } from '@/data/suppliers';
import { initialProducts } from '@/data/products';

export function PurchaseOrderModal({ isOpen, onClose, initialItem, onOrderCreated }) {
  const [supplierId, setSupplierId] = useState('sup-001');
  const [items, setItems] = useState([
    {
      productId: 'prod-001',
      name: 'Farm Fresh Milk 1L (Whole)',
      sku: 'MILK-001',
      quantity: 80,
      unitCost: 45,
      total: 3600,
      image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=400&q=80',
    },
    {
      productId: 'prod-002',
      name: 'Artisan Whole Wheat Sourdough Bread',
      sku: 'BAK-102',
      quantity: 40,
      unitCost: 70,
      total: 2800,
      image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80',
    },
  ]);
  const [expectedDate, setExpectedDate] = useState('2024-08-25');
  const [notes, setNotes] = useState('AI Recommended reorder batch to prevent 3-day stockouts.');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (initialItem) {
      const existingIdx = items.findIndex((i) => i.sku === initialItem.sku || i.name === initialItem.name);
      if (existingIdx >= 0) {
        const updated = [...items];
        updated[existingIdx].quantity = initialItem.suggestedReorder || initialItem.stock || 40;
        updated[existingIdx].total = updated[existingIdx].quantity * updated[existingIdx].unitCost;
        setItems(updated);
      } else {
        const newItem = {
          productId: initialItem.id || 'custom',
          name: initialItem.name || 'Custom Item',
          sku: initialItem.sku || 'SKU-000',
          quantity: initialItem.suggestedReorder || 40,
          unitCost: initialItem.costPrice || 1000,
          total: (initialItem.suggestedReorder || 40) * (initialItem.costPrice || 1000),
        };
        setItems([newItem, ...items]);
      }
      if (initialItem.supplierId) {
        setSupplierId(initialItem.supplierId);
      }
    }
  }, [initialItem]);

  const updateQuantity = (index, qty) => {
    const numericQty = Math.max(1, Number(qty) || 1);
    const updated = [...items];
    updated[index].quantity = numericQty;
    updated[index].total = numericQty * updated[index].unitCost;
    setItems(updated);
  };

  const removeItem = (index) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const totalCost = items.reduce((acc, item) => acc + item.total, 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const selectedSup = initialSuppliers.find((s) => s.id === supplierId) || initialSuppliers[0];

    const newPO = {
      id: `PO-${Math.floor(1000 + Math.random() * 9000)}`,
      poNumber: `PO-2024-${Math.floor(1000 + Math.random() * 9000)}`,
      supplier: selectedSup.name,
      supplierId: selectedSup.id,
      orderDate: new Date().toISOString().split('T')[0],
      expectedDelivery: expectedDate,
      totalCost,
      status: 'Pending Approval',
      isAiGenerated: true,
      items: [...items],
      notes,
    };

    setTimeout(() => {
      setIsSubmitting(false);
      setSuccess(true);
      if (onOrderCreated) {
        onOrderCreated(newPO);
      }
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1200);
    }, 600);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Intelligent Purchase Order"
      subtitle="AI predicted restock requirements prefilled from sales velocity analysis"
      maxWidth="max-w-2xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Total Estimated Cost:{' '}
            <span className="text-base font-black text-slate-900 dark:text-slate-100 ml-1">
              ₹{totalCost.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={ShoppingCart}
              loading={isSubmitting}
              onClick={handleSubmit}
            >
              Confirm & Create PO
            </Button>
          </div>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {success && (
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-2.5 text-xs text-emerald-800 dark:text-emerald-300 font-semibold animate-fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span>Purchase Order generated successfully and added to procurement queue!</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Supplier"
            value={supplierId}
            onChange={(e) => setSupplierId(e.target.value)}
            options={initialSuppliers.map((s) => ({ value: s.id, label: `${s.name} (Rating: ${s.rating}★)` }))}
            required
          />
          <Input
            label="Expected Delivery Date"
            type="date"
            value={expectedDate}
            onChange={(e) => setExpectedDate(e.target.value)}
            required
          />
        </div>

        {/* Order items table */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              AI Suggested Order Items
            </label>
            <span className="text-xs text-slate-400">Editable Quantities</span>
          </div>

          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-200 dark:divide-slate-800">
            {items.map((item, idx) => (
              <div key={idx} className="p-3 bg-white dark:bg-slate-900 flex items-center justify-between gap-3 text-sm">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-10 h-10 rounded-lg object-cover border border-slate-200 dark:border-slate-700 flex-shrink-0"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-slate-800 dark:text-slate-200 truncate">{item.name}</div>
                    <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                      <span>SKU: {item.sku}</span>
                      <span>•</span>
                      <span>Cost: ₹{item.unitCost}/unit</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateQuantity(idx, e.target.value)}
                      className="w-16 px-2 py-1 text-center font-bold text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <span className="text-xs text-slate-400">units</span>
                  </div>

                  <div className="w-24 text-right font-bold text-slate-900 dark:text-slate-100">
                    ₹{item.total.toLocaleString()}
                  </div>

                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(idx)}
                      className="p-1 rounded-md text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <Input
          label="Order Notes / Procurement Rationale"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Enter additional instructions for the supplier..."
        />
      </form>
    </Modal>
  );
}
