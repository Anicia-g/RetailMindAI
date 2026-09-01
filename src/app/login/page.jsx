'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Crown,
  Store,
  ShoppingBag,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useAppSettings } from '@/context/AppSettingsContext';
import { getRoleHomeRoute, ROLES } from '@/lib/auth';
import { Button } from '@/components/common/Button';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuth();
  const { t } = useAppSettings();

  const [email, setEmail] = useState('admin@retailmind.ai');
  const [password, setPassword] = useState('admin1234');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const demoAccounts = [
    {
      role: 'ADMIN',
      title: 'Admin',
      subtitle: 'Executive Command Center',
      email: 'admin@retailmind.ai',
      pass: 'admin1234',
      icon: Crown,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    },
    {
      role: 'SELLER',
      title: 'Seller',
      subtitle: 'Store & Shift Terminal',
      email: 'seller@retailmind.ai',
      pass: 'seller1234',
      icon: Store,
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    },
    {
      role: 'CUSTOMER',
      title: 'Customer',
      subtitle: 'Supermarket Storefront',
      email: 'customer@retailmind.ai',
      pass: 'customer1234',
      icon: ShoppingBag,
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    },
  ];

  const handleSelectDemo = (acc) => {
    setEmail(acc.email);
    setPassword(acc.pass);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      // Authenticates via BCrypt and issues JWT token containing Role
      const result = await login(email, password);
      const destination = getRoleHomeRoute(result.user?.role);
      router.push(destination);
    } catch (err) {
      setError(err.message || t('invalidCredentials'));
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-slate-950 text-slate-100 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-cyan-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Main Single Centered Login Card */}
      <div className="w-full max-w-lg bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 animate-fade-in space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-400 text-white shadow-lg shadow-indigo-500/30 mb-1">
            <Sparkles className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            RETAILMIND <span className="text-indigo-400">AI</span>
          </h1>
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-300">
            {t('appTagline')}
          </p>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            {t('loginSubtitle')}
          </p>
        </div>

        {/* Demo Role Selector Pills */}
        <div className="space-y-2">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center">
            Select Role Demo Account:
          </div>
          <div className="grid grid-cols-3 gap-2">
            {demoAccounts.map((acc) => {
              const Icon = acc.icon;
              const isSelected = email === acc.email;
              return (
                <button
                  key={acc.role}
                  type="button"
                  onClick={() => handleSelectDemo(acc)}
                  className={`p-2.5 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-950/80 border-indigo-500 text-white shadow-md ring-1 ring-indigo-500'
                      : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <Icon className="w-4 h-4 text-indigo-400" />
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border ${acc.badgeColor}`}>
                      {acc.title}
                    </span>
                  </div>
                  <div className="mt-2 min-w-0">
                    <div className="text-xs font-bold truncate">{acc.title}</div>
                    <div className="text-[10px] text-slate-400 truncate">{acc.email.split('@')[0]}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-medium flex items-center gap-2 animate-fade-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Single Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3.5">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block mb-1.5">
                {t('emailOrUsername')}
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-3 text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@retailmind.ai"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800/90 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block mb-1.5">
                {t('password')}
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-3 text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-700 bg-slate-800/90 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                defaultChecked
                className="rounded border-slate-700 text-indigo-600 focus:ring-0 bg-slate-800"
              />
              <span>{t('rememberMe')}</span>
            </label>
            <span className="text-[11px] text-slate-400">
              Demo passwords: <span className="font-mono text-indigo-300">admin1234</span>
            </span>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full shadow-lg shadow-indigo-600/30 bg-indigo-600 hover:bg-indigo-500 font-bold cursor-pointer"
            loading={submitting || isLoading}
            icon={ArrowRight}
            iconPosition="right"
          >
            {submitting ? t('loggingIn') : t('login')}
          </Button>
        </form>
      </div>
    </div>
  );
}
