'use client';

import React, { useRef, useEffect } from 'react';

/**
 * 6-Digit Auto-Advancing OTP Input Component
 */
export function OTPInput({
  value = ['', '', '', '', '', ''],
  onChange,
  disabled = false,
  autoFocus = true,
  hasError = false,
}) {
  const inputsRef = useRef([]);

  useEffect(() => {
    if (autoFocus && inputsRef.current[0] && !disabled) {
      inputsRef.current[0].focus();
    }
  }, [autoFocus, disabled]);

  const handleChange = (e, index) => {
    const val = e.target.value;
    // Extract only digits
    const digits = val.replace(/\D/g, '');

    if (!digits) {
      const nextValue = [...value];
      nextValue[index] = '';
      onChange(nextValue);
      return;
    }

    // Handle single digit input
    const nextValue = [...value];
    nextValue[index] = digits[digits.length - 1]; // Use last typed digit
    onChange(nextValue);

    // Auto-advance to next box if not the last
    if (index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (!value[index] && index > 0) {
        // If current is empty, focus previous and clear it
        const nextValue = [...value];
        nextValue[index - 1] = '';
        onChange(nextValue);
        inputsRef.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputsRef.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '');
    if (!pastedData) return;

    const nextValue = [...value];
    for (let i = 0; i < 6; i++) {
      if (i < pastedData.length) {
        nextValue[i] = pastedData[i];
      }
    }
    onChange(nextValue);

    // Focus last filled index or the 6th input
    const targetIndex = Math.min(pastedData.length, 5);
    inputsRef.current[targetIndex]?.focus();
  };

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
      {Array.from({ length: 6 }).map((_, index) => (
        <input
          key={index}
          ref={(el) => (inputsRef.current[index] = el)}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={2}
          value={value[index] || ''}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          disabled={disabled}
          aria-label={`Digit ${index + 1} of verification code`}
          className={`w-10 h-12 sm:w-12 sm:h-14 text-center font-mono font-bold text-lg sm:text-xl rounded-2xl border transition-all select-none focus:outline-none ${
            disabled
              ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 cursor-not-allowed'
              : hasError
              ? 'border-rose-500 bg-rose-500/10 text-rose-300 focus:ring-2 focus:ring-rose-500'
              : value[index]
              ? 'border-indigo-500 dark:border-indigo-400 bg-indigo-50/30 dark:bg-indigo-950/40 text-slate-900 dark:text-white ring-1 ring-indigo-500/40'
              : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
          }`}
        />
      ))}
    </div>
  );
}
