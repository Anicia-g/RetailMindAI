'use client';

import React, { useState } from 'react';
import {
  MessageSquare,
  X,
  CheckCircle2,
  Sparkles,
  Tag,
  Clock,
  Send,
  ShieldCheck,
  ArrowRight,
  Copy,
  Check,
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { notificationService } from '@/services/notificationService';

export function WhatsAppOfferModal({
  isOpen,
  onClose,
  offer,
  customerName = 'Vikram',
}) {
  const [copied, setCopied] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  if (!isOpen || !offer) return null;

  const preview = notificationService.generateWhatsAppOfferPreview(offer, customerName);
  const promoCode = offer?.code || (offer?.discountPct ? `FRESH${offer.discountPct}` : 'FRESH10');

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(promoCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubscribe = () => {
    notificationService.subscribeToDealAlerts('default', offer.id || promoCode);
    setSubscribed(true);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/75 backdrop-blur-md transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl z-10 animate-fade-in space-y-5 text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black flex items-center gap-1.5">
                WhatsApp Offer Notification
              </h3>
              <p className="text-[10px] text-slate-400">Automated Smart Discount Alert</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* WhatsApp Chat Preview Mockup */}
        <div className="rounded-2xl bg-slate-950/80 border border-slate-800 p-4 space-y-3 relative overflow-hidden">
          {/* Chat Header Bar */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/80 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-black text-[10px] flex items-center justify-center">
                RM
              </div>
              <div>
                <span className="font-bold text-white flex items-center gap-1">
                  RetailMind Mart <CheckCircle2 className="w-3 h-3 text-emerald-400 fill-emerald-400" />
                </span>
                <span className="text-[9px] text-emerald-400 block font-semibold">Official Business Account</span>
              </div>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">12:30 PM</span>
          </div>

          {/* WhatsApp Chat Bubble */}
          <div className="p-3.5 rounded-2xl bg-emerald-950/50 border border-emerald-800/40 text-emerald-100 text-xs space-y-2 relative shadow-xs">
            <div className="whitespace-pre-line leading-relaxed text-[11px] font-sans">
              {preview.messageText}
            </div>

            <div className="pt-2 border-t border-emerald-800/40 flex items-center justify-between text-[10px] text-emerald-300">
              <span className="font-mono uppercase font-bold">Channel: WhatsApp API</span>
              <span className="font-bold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Delivered
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={handleCopyCode}
              className="flex-1 text-xs font-bold border-slate-700 hover:border-slate-500"
              icon={copied ? Check : Copy}
            >
              {copied ? 'Code Copied!' : `Copy Code: ${promoCode}`}
            </Button>

            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={handleSubscribe}
              disabled={subscribed}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-xs font-bold shadow-md shadow-emerald-600/20"
              icon={subscribed ? CheckCircle2 : MessageSquare}
            >
              {subscribed ? 'Alert Enabled ✓' : 'Notify on WhatsApp'}
            </Button>
          </div>

          <p className="text-[10px] text-center text-slate-400 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-500" />
            Backend ready: Real WhatsApp delivery managed via Express WhatsApp Business API.
          </p>
        </div>
      </div>
    </div>
  );
}
