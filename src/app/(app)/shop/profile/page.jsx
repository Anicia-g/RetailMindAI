'use client';

import React, { useState } from 'react';
import {
  User,
  MapPin,
  Sparkles,
  Phone,
  Mail,
  Heart,
  Save,
  CheckCircle2,
  Gift,
  ShieldCheck,
  ShoppingBag,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Badge } from '@/components/common/Badge';

export default function ShopProfilePage() {
  const { user } = useAuth();

  const [phone, setPhone] = useState('+91 98450 11234');
  const [address, setDeliveryAddress] = useState(
    'Flat 402, Palm Heights, 12th Main, Indiranagar, Bangalore - 560038'
  );
  const [prefOrganic, setPrefOrganic] = useState(true);
  const [prefDairy, setPrefDairy] = useState(true);
  const [prefEco, setPrefEco] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 pb-16 max-w-4xl mx-auto">
      {/* Profile Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-950 text-white shadow-xl border border-emerald-800/40 flex flex-col sm:flex-row items-center gap-5">
        <img
          src={user?.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80'}
          alt={user?.name || 'Customer'}
          className="w-20 h-20 rounded-full object-cover border-2 border-emerald-400 shadow-md"
        />
        <div className="text-center sm:text-left space-y-1">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <span className="text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/30 border border-emerald-400/30 text-emerald-300">
              Supermarket VIP Member
            </span>
            <Badge variant="success" size="sm">Gold Tier</Badge>
          </div>
          <h2 className="text-2xl font-black">{user?.name || 'Vikram Malhotra'}</h2>
          <p className="text-xs text-emerald-200">
            {user?.email || 'customer@retailmind.ai'} • Preferred Store: <strong>{user?.store || 'Indiranagar Flagship'}</strong>
          </p>
        </div>
      </div>

      {saved && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>Profile and delivery address updated successfully!</span>
        </div>
      )}

      {/* SmartCoins Loyalty Banner */}
      <div className="p-5 rounded-3xl border border-amber-200 dark:border-amber-900/50 bg-gradient-to-r from-amber-50/70 to-yellow-50/40 dark:from-amber-950/30 dark:to-slate-900 shadow-xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-400/20 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-black text-sm text-slate-900 dark:text-slate-100">
              450 SmartCoins Available
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Worth <strong>₹450</strong> store credit. Automatically redeemable at checkout.
            </p>
          </div>
        </div>

        <Badge variant="warning" size="md">
          Earn 5% on every order
        </Badge>
      </div>

      {/* Edit Customer Profile Form */}
      <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-5">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <User className="w-4 h-4 text-emerald-600" />
          Customer Information & Delivery Settings
        </h3>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              value={user?.name || 'Vikram Malhotra'}
              disabled
            />
            <Input
              label="Account Email"
              value={user?.email || 'customer@retailmind.ai'}
              disabled
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Mobile Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <Input
              label="Preferred Local Supermarket"
              value={user?.store || 'Indiranagar Flagship (Store 01)'}
              disabled
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
              Default Delivery Address
            </label>
            <textarea
              rows={2}
              value={address}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              className="w-full px-3.5 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          {/* Preferences */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Shopping & Dietary Preferences
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <label className="flex items-center gap-2 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold cursor-pointer">
                <input
                  type="checkbox"
                  checked={prefOrganic}
                  onChange={(e) => setPrefOrganic(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-0"
                />
                <span>Organic & Farm Fresh</span>
              </label>

              <label className="flex items-center gap-2 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold cursor-pointer">
                <input
                  type="checkbox"
                  checked={prefDairy}
                  onChange={(e) => setPrefDairy(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-0"
                />
                <span>Daily Milk & Bakery</span>
              </label>

              <label className="flex items-center gap-2 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold cursor-pointer">
                <input
                  type="checkbox"
                  checked={prefEco}
                  onChange={(e) => setPrefEco(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-0"
                />
                <span>Eco-friendly Packaging</span>
              </label>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="md"
              icon={Save}
              className="bg-emerald-600 hover:bg-emerald-700 font-bold"
            >
              Save Profile
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
