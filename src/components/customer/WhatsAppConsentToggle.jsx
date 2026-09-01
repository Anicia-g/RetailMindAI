'use client';

import React, { useState, useEffect } from 'react';
import { MessageSquare, CheckCircle2, ShieldCheck, Smartphone } from 'lucide-react';
import { notificationService } from '@/services/notificationService';

export function WhatsAppConsentToggle({
  customerId = 'default',
  phoneNumber = '+91 98450 11234',
  onChange,
}) {
  const [enabled, setEnabled] = useState(true);
  const [saveIndicator, setSaveIndicator] = useState(false);

  useEffect(() => {
    const prefs = notificationService.getWhatsAppPreferences(customerId);
    setEnabled(prefs.enabled);
  }, [customerId]);

  const handleToggle = (newVal) => {
    setEnabled(newVal);
    notificationService.updateWhatsAppPreferences(customerId, {
      enabled: newVal,
      phoneNumber,
      consentDate: newVal ? new Date().toISOString() : null,
    });

    if (onChange) onChange(newVal);

    setSaveIndicator(true);
    setTimeout(() => setSaveIndicator(false), 2500);
  };

  return (
    <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex-shrink-0 mt-0.5">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                WhatsApp Notifications
              </h4>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                Verified: {phoneNumber}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Receive personalized smart offers, flash supermarket discounts, and order status updates directly on your WhatsApp.
            </p>
          </div>
        </div>

        {/* Toggle Switch */}
        <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 mt-1">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => handleToggle(e.target.checked)}
            className="sr-only peer"
            aria-label="Toggle WhatsApp Notifications"
          />
          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-600"></div>
        </label>
      </div>

      {/* Consent & Status Note */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          Opt-in consent active. You can change preferences anytime.
        </span>

        {saveIndicator && (
          <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 animate-fade-in">
            <CheckCircle2 className="w-3 h-3" />
            Preference Saved
          </span>
        )}
      </div>
    </div>
  );
}
