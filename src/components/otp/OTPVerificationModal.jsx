'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  X,
  Clock,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { OTPInput } from './OTPInput';
import { Button } from '@/components/common/Button';
import { otpService } from '@/services/otpService';

export function OTPVerificationModal({
  isOpen,
  onClose,
  onSuccess,
  identifier = '+91 98450 11234',
  purpose = 'ACCOUNT_VERIFICATION',
  title = 'Verify Your Account',
  description = 'We sent a 6-digit verification code to:',
}) {
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(60);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [maskedTarget, setMaskedTarget] = useState('');

  // Send initial OTP on open
  useEffect(() => {
    if (isOpen) {
      setOtpDigits(['', '', '', '', '', '']);
      setError('');
      setIsSuccess(false);
      setCountdown(60);

      otpService.sendOtp(identifier, purpose).then((res) => {
        if (res.maskedTarget) setMaskedTarget(res.maskedTarget);
      });
    }
  }, [isOpen, identifier, purpose]);

  // Countdown ticker
  useEffect(() => {
    if (!isOpen || countdown <= 0 || isSuccess) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, countdown, isSuccess]);

  if (!isOpen) return null;

  const enteredCode = otpDigits.join('');
  const isComplete = enteredCode.length === 6;

  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    if (!isComplete || isVerifying) return;

    setError('');
    setIsVerifying(true);

    try {
      const result = await otpService.verifyOtp(identifier, enteredCode, purpose);
      if (result.success) {
        setIsSuccess(true);
        setTimeout(() => {
          if (onSuccess) onSuccess();
          onClose();
        }, 1200);
      }
    } catch (err) {
      setError(err.message || 'Invalid verification code. Please try again.');
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || isResending) return;
    setIsResending(true);
    setError('');

    try {
      await otpService.resendOtp(identifier, purpose);
      setCountdown(60);
      setOtpDigits(['', '', '', '', '', '']);
      setIsResending(false);
    } catch (err) {
      setError('Unable to resend verification code. Please try again.');
      setIsResending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-md transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 animate-fade-in space-y-6 text-slate-900 dark:text-slate-100">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black tracking-tight">{title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Two-Factor Security Confirmation
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          /* Success State */
          <div className="py-8 text-center space-y-3 animate-fade-in">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-500 mx-auto flex items-center justify-center border border-emerald-500/40">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="font-black text-base text-emerald-600 dark:text-emerald-400">
              Verification Successful!
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Your identity has been confirmed. Updating account...
            </p>
          </div>
        ) : (
          /* Verification Form */
          <div className="space-y-6">
            <div className="text-center space-y-1">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {description}
              </p>
              <div className="font-mono font-bold text-sm text-indigo-600 dark:text-indigo-400 tracking-wider">
                {maskedTarget || identifier}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2 animate-fade-in">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* 6 Digit Inputs */}
            <OTPInput
              value={otpDigits}
              onChange={setOtpDigits}
              disabled={isVerifying}
              hasError={!!error}
            />

            {/* Development OTP Hint */}
            <div className="text-center">
              <span className="text-[11px] text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-full font-mono">
                Demo Test OTP: <strong className="text-indigo-600 dark:text-indigo-400">123456</strong>
              </span>
            </div>

            {/* Action Buttons & Resend */}
            <div className="space-y-3 pt-2">
              <Button
                type="button"
                variant="primary"
                size="lg"
                loading={isVerifying}
                disabled={!isComplete}
                onClick={handleVerify}
                className="w-full bg-emerald-600 hover:bg-emerald-700 font-bold shadow-lg shadow-emerald-600/25 cursor-pointer"
                icon={ArrowRight}
                iconPosition="right"
              >
                {isVerifying ? 'Verifying Code...' : 'Verify & Continue'}
              </Button>

              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
                <span>Didn't receive the code?</span>
                {countdown > 0 ? (
                  <span className="flex items-center gap-1 font-mono text-[11px] text-slate-400">
                    <Clock className="w-3.5 h-3.5" />
                    Resend in {countdown}s
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={isResending}
                    className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Resend OTP</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
