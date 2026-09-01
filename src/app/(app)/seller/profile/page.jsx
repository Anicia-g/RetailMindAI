'use client';

import React, { useState } from 'react';
import {
  User,
  Store,
  Mail,
  Phone,
  Calendar,
  Award,
  Shield,
  Clock,
  Save,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { initialEmployees } from '@/data/employees';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Badge } from '@/components/common/Badge';

export default function SellerProfilePage() {
  const { user } = useAuth();
  const currentSeller =
    initialEmployees.find((e) => e.email === user?.email) || initialEmployees[0];

  const [phone, setPhone] = useState('+91 98450 22345');
  const [department, setDepartment] = useState(currentSeller.topCategory || 'Dairy & Fresh Produce');
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Profile Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950 via-slate-900 to-purple-950 text-white shadow-xl border border-purple-900/40 flex flex-col sm:flex-row items-center gap-5">
        <img
          src={user?.image || currentSeller.avatar}
          alt={user?.name || currentSeller.name}
          className="w-20 h-20 rounded-2xl object-cover border-2 border-purple-400 shadow-md"
        />
        <div className="text-center sm:text-left space-y-1">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <span className="text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded bg-purple-500/30 border border-purple-400/30 text-purple-300">
              Seller Terminal Account
            </span>
            <Badge variant="purple" size="sm">Active Shift</Badge>
          </div>
          <h2 className="text-2xl font-black">{user?.name || currentSeller.name}</h2>
          <p className="text-xs text-purple-200">
            Employee ID: <strong className="font-mono">EMP-2024-002</strong> • Store: <strong>{user?.store || currentSeller.store}</strong>
          </p>
        </div>
      </div>

      {saved && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>Profile details updated successfully.</span>
        </div>
      )}

      {/* Edit Form */}
      <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-5">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <User className="w-4 h-4 text-purple-600" />
          Seller Employee Information
        </h3>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              value={user?.name || currentSeller.name}
              disabled
            />
            <Input
              label="Official Email"
              value={user?.email || currentSeller.email}
              disabled
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Contact Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <Input
              label="Assigned Store / Terminal"
              value={user?.store || currentSeller.store}
              disabled
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Assigned Category Lead"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            />
            <Input
              label="Daily Shift Hours"
              value="10:00 AM - 06:00 PM (8 hrs)"
              disabled
            />
          </div>

          <div className="pt-2 flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="md"
              icon={Save}
              className="bg-purple-600 hover:bg-purple-700 font-bold"
            >
              Save Profile
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
