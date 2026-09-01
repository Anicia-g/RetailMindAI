'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Crown,
  Store,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Zap,
  Mic,
  MessageSquare,
  Lock,
  Cpu,
  BarChart3,
  Truck,
  CheckCircle2,
  TrendingUp,
  LogIn,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getRoleHomeRoute, ROLES } from '@/lib/auth';
import { Button } from '@/components/common/Button';

export default function LandingPage() {
  const router = useRouter();
  const { isAuthenticated, role, user } = useAuth();

  const activeWorkspaceRoute = isAuthenticated ? getRoleHomeRoute(role) : '/login';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white relative overflow-hidden font-sans">
      {/* Ambient glowing backdrop */}
      <div className="absolute -top-40 -left-40 w-[32rem] h-[32rem] bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-40 w-[30rem] h-[30rem] bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 left-1/3 w-[36rem] h-[36rem] bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Public Header */}
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-xl px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 text-white shadow-lg shadow-indigo-500/25">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="font-black text-lg sm:text-xl tracking-tight text-white flex items-center gap-1.5">
              RETAILMIND <span className="text-indigo-400">AI</span>
            </div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Autonomous Retail Intelligence
            </div>
          </div>
        </Link>

        {/* Header Right CTAs */}
        <div className="flex items-center gap-2 sm:gap-3">
          {isAuthenticated ? (
            <Link
              href={activeWorkspaceRoute}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <span>Enter Workspace ({role})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 text-xs font-semibold transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Login</span>
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all"
              >
                <span>Get Started</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Authenticated User Quick Access Notification Banner */}
      {isAuthenticated && (
        <div className="bg-gradient-to-r from-indigo-950/80 via-slate-900 to-purple-950/80 border-b border-indigo-500/30 px-4 py-2.5 text-center text-xs font-medium text-indigo-200 flex items-center justify-center gap-2">
          <span>
            Signed in as <strong>{user?.name || 'Authorized User'}</strong> ({role} Role)
          </span>
          <span>•</span>
          <Link href={activeWorkspaceRoute} className="underline font-bold text-white hover:text-indigo-300">
            Open {role === ROLES.ADMIN ? 'Executive Dashboard' : role === ROLES.SELLER ? 'Seller Terminal' : 'Supermarket Storefront'} →
          </Link>
        </div>
      )}

      {/* Main Hero Section */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-20 space-y-16 sm:space-y-24">
        <section className="text-center space-y-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold animate-fade-in shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Next-Gen Enterprise Retail & Supermarket AI</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-tight">
            One Intelligent Platform for <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-teal-300 bg-clip-text text-transparent">
              Admins, Sellers & Shoppers
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
            RetailMind AI unifies Executive Predictive BI, Real-Time Seller POS Terminals, and Fresh Supermarket Commerce with Role-Aware Voice Navigation, Machine Learning, and Automated Customer Engagement.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-sm transition-all"
            >
              <LogIn className="w-4 h-4 text-slate-400" />
              <span>Login with Role Demo</span>
            </Link>

            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-600/40 text-emerald-300 font-bold text-sm transition-all"
            >
              <ShoppingBag className="w-4 h-4 text-emerald-400" />
              <span>Shop Supermarket</span>
            </Link>
          </div>
        </section>

        {/* 3 Platform Personas Showcase */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Three Unified Role Workspaces
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Role-protected views with isolated permissions and tailored AI copilot assistants.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Persona 1: Admin Command Center */}
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 shadow-xl transition-all space-y-4 flex flex-col justify-between group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                    <Crown className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    ADMIN
                  </span>
                </div>

                <h3 className="text-lg font-black text-white group-hover:text-indigo-400 transition-colors">
                  Enterprise Executive Command
                </h3>

                <p className="text-xs text-slate-400 leading-relaxed">
                  Full command center across retail branches, supplier lead-time scorecards, multi-store stock rebalancing, and customer LTV segmentation.
                </p>

                <ul className="space-y-2 text-xs text-slate-300 pt-2 border-t border-slate-800">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                    <span>K-Means RFM Customer Clustering</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                    <span>Stock-Out Risk & Demand Forecasting</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                    <span>Autonomous Purchase Order Requisitions</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/login"
                className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-800 hover:bg-indigo-600 text-xs font-bold text-slate-200 hover:text-white transition-colors"
              >
                <span>Launch Admin View</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Persona 2: Seller Shift Terminal */}
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-purple-500/50 shadow-xl transition-all space-y-4 flex flex-col justify-between group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                    <Store className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    SELLER
                  </span>
                </div>

                <h3 className="text-lg font-black text-white group-hover:text-purple-400 transition-colors">
                  Store & Shift Terminal
                </h3>

                <p className="text-xs text-slate-400 leading-relaxed">
                  Streamlined front-line terminal for fast POS sales logging, shift quota metrics, aisle inventory replenishment, and ML-recommended discounts.
                </p>

                <ul className="space-y-2 text-xs text-slate-300 pt-2 border-t border-slate-800">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                    <span>Rapid POS Sale & Cash/UPI Recording</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                    <span>C4.5 Decision Tree Smart Discounts</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                    <span>Shift Quotas & Store Customer CRM</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/login"
                className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-800 hover:bg-purple-600 text-xs font-bold text-slate-200 hover:text-white transition-colors"
              >
                <span>Launch Seller Terminal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Persona 3: Customer Smart Supermarket */}
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 shadow-xl transition-all space-y-4 flex flex-col justify-between group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    CUSTOMER
                  </span>
                </div>

                <h3 className="text-lg font-black text-white group-hover:text-emerald-400 transition-colors">
                  Smart Supermarket Storefront
                </h3>

                <p className="text-xs text-slate-400 leading-relaxed">
                  High-speed grocery shopping with farm-fresh produce, 15-minute express local delivery, SmartCoins cashback, and personalized flash deals.
                </p>

                <ul className="space-y-2 text-xs text-slate-300 pt-2 border-t border-slate-800">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    <span>Farm Fresh Produce & Instant Delivery</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    <span>Ask AI Grocer for Recipes & Deals</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    <span>SmartCoins Loyalty & WhatsApp Offers</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/login"
                className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-800 hover:bg-emerald-600 text-xs font-bold text-slate-200 hover:text-white transition-colors"
              >
                <span>Launch Supermarket</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>

        {/* Feature Highlights Grid */}
        <section className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800/80 space-y-6">
          <div className="text-center space-y-1">
            <h3 className="text-lg font-black text-white">Platform Intelligence & Security</h3>
            <p className="text-xs text-slate-400">Enterprise grade capabilities built directly into the system</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <Mic className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-xs text-white">Voice Navigation</h4>
              <p className="text-[11px] text-slate-400">
                Natural speech command navigation strictly gated by role authorization rules.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                <Cpu className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-xs text-white">Voice AI Copilots</h4>
              <p className="text-[11px] text-slate-400">
                Speech-to-text input and response vocalization across all 3 AI personas.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <MessageSquare className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-xs text-white">WhatsApp Offer Alerts</h4>
              <p className="text-[11px] text-slate-400">
                Consent-managed personalized offer delivery prepared for WhatsApp Business API.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-xs text-white">OTP Verification</h4>
              <p className="text-[11px] text-slate-400">
                6-digit auto-advancing verification for sensitive actions and account security.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 px-4 sm:px-8 py-8 text-center text-xs text-slate-500 space-y-2">
        <div className="font-bold text-slate-400">
          RETAILMIND AI — Autonomous Retail & Supermarket Intelligence Platform
        </div>
        <p className="text-[11px]">
          Equipped with BCrypt Authentication, JWT Role Guards, K-Means Clustering, ID3/C4.5 Decision Trees & Web Speech Capabilities.
        </p>
      </footer>
    </div>
  );
}
