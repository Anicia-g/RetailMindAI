'use client';

import React, { useEffect, useState, useRef } from 'react';
import { ShieldCheck, AlertCircle, RefreshCw, ExternalLink, Sparkles } from 'lucide-react';
import { apiClient } from '@/lib/apiClient';

export function PayPalButtonContainer({
  amount,
  items = [],
  deliveryAddress = '',
  onSuccess,
  onError,
}) {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const buttonsRenderedRef = useRef(false);

  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '';
  const currency = process.env.NEXT_PUBLIC_PAYPAL_CURRENCY || 'USD';
  const exchangeRate = parseFloat(process.env.NEXT_PUBLIC_PAYPAL_EXCHANGE_RATE || '85');
  const usdAmount = (amount / exchangeRate).toFixed(2);

  const hasValidClientId = clientId && clientId.trim().length > 10 && !clientId.includes('your_paypal');

  useEffect(() => {
    if (!hasValidClientId) return;

    const scriptId = 'paypal-sdk-script';
    const existingScript = document.getElementById(scriptId);

    const onScriptReady = () => {
      setIsScriptLoaded(true);
    };

    if (existingScript) {
      if (window.paypal) {
        setIsScriptLoaded(true);
      } else {
        existingScript.addEventListener('load', onScriptReady);
      }
      return;
    }

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=${currency}&intent=capture`;
    script.async = true;
    script.onload = onScriptReady;
    script.onerror = () => {
      setLoadError('Failed to load PayPal SDK. Please verify your internet connection and Client ID.');
    };

    document.body.appendChild(script);

    return () => {
      // Keep script cached in DOM
    };
  }, [hasValidClientId, clientId, currency]);

  // Render PayPal Buttons once SDK is ready
  useEffect(() => {
    if (!isScriptLoaded || !window.paypal || buttonsRenderedRef.current) return;

    const container = document.getElementById('paypal-button-container');
    if (!container) return;

    container.innerHTML = '';
    buttonsRenderedRef.current = true;

    try {
      window.paypal
        .Buttons({
          style: {
            layout: 'vertical',
            color: 'gold',
            shape: 'rect',
            label: 'paypal',
            height: 44,
          },
          createOrder: async () => {
            setPaymentError('');
            setIsProcessing(true);
            try {
              const res = await apiClient.post('/payments/paypal/create-order', {
                amount,
                grandTotal: amount,
                items: items.map((i) => ({
                  productId: i.id || i.productId,
                  name: i.name,
                  qty: i.quantity,
                  price: i.price,
                })),
              });

              if (!res || !res.data || !res.data.orderId) {
                throw new Error(res?.message || 'Server did not return a valid PayPal order ID');
              }

              return res.data.orderId;
            } catch (err) {
              setIsProcessing(false);
              const msg = err.message || 'Error creating PayPal order.';
              setPaymentError(msg);
              if (onError) onError(msg);
              throw err;
            }
          },
          onApprove: async (data) => {
            setIsProcessing(true);
            try {
              const res = await apiClient.post('/payments/paypal/capture-order', {
                paypalOrderId: data.orderID,
                orderData: {
                  items: items.map((i) => ({
                    productId: i.id || i.productId,
                    name: i.name,
                    quantity: i.quantity,
                    price: i.price,
                  })),
                  totalAmount: amount,
                  deliveryAddress,
                  paymentMethod: 'PAYPAL',
                },
              });

              setIsProcessing(false);
              if (onSuccess) {
                onSuccess(res.data?.order || res.data);
              }
            } catch (err) {
              setIsProcessing(false);
              const msg = err.message || 'Payment capture failed. Please try again.';
              setPaymentError(msg);
              if (onError) onError(msg);
            }
          },
          onError: (err) => {
            setIsProcessing(false);
            console.error('[PayPal SDK Error]:', err);
            const msg = 'PayPal transaction window encountered an error or was closed.';
            setPaymentError(msg);
            if (onError) onError(msg);
          },
          onCancel: () => {
            setIsProcessing(false);
          },
        })
        .render('#paypal-button-container');
    } catch (err) {
      console.error('Error rendering PayPal Buttons:', err);
      buttonsRenderedRef.current = false;
    }
  }, [isScriptLoaded, amount, items, deliveryAddress, onSuccess, onError]);

  // Demo fallback simulation for instant verification when testing without live sandbox keys
  const handleSimulateSandboxSuccess = async () => {
    setIsProcessing(true);
    setPaymentError('');

    try {
      const mockPaypalOrderId = `MOCK-PAYPAL-${Date.now()}`;
      // Direct call to capture or order completion
      const res = await apiClient.post('/orders', {
        items: items.map((i) => ({
          productId: i.id || i.productId,
          name: i.name,
          quantity: i.quantity,
          price: i.price,
        })),
        totalAmount: amount,
        deliveryAddress,
        paymentMethod: 'PAYPAL',
        gateway: 'PayPal Sandbox (Simulated)',
        transactionRef: `TXN-PP-${Date.now().toString().slice(-6)}`,
      });

      setIsProcessing(false);
      if (onSuccess) {
        onSuccess(res.data);
      }
    } catch (err) {
      setIsProcessing(false);
      setPaymentError(err.message || 'Error executing demo order placement.');
    }
  };

  return (
    <div className="space-y-3.5">
      {/* Error Banners */}
      {(paymentError || loadError) && (
        <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{paymentError || loadError}</span>
        </div>
      )}

      {/* Processing State */}
      {isProcessing && (
        <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-center space-y-2 animate-fade-in">
          <RefreshCw className="w-5 h-5 mx-auto text-indigo-600 animate-spin" />
          <div className="font-bold text-xs text-indigo-900 dark:text-indigo-200">
            Processing PayPal Sandbox Transaction...
          </div>
          <p className="text-[11px] text-slate-500">
            Capturing payment and securing your supermarket order in database.
          </p>
        </div>
      )}

      {/* Dynamic Currency Conversion Badge */}
      <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs">
        <div>
          <span className="text-slate-500 dark:text-slate-400 font-medium block">Total Payable:</span>
          <span className="font-black text-slate-900 dark:text-slate-100">
            ₹{Number(amount).toLocaleString()}
          </span>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-slate-400 block uppercase font-bold">PayPal USD Equivalent:</span>
          <span className="font-mono font-black text-indigo-600 dark:text-indigo-400">
            ${usdAmount} USD <span className="text-[10px] text-slate-400 font-normal">(@ ₹{exchangeRate}/$)</span>
          </span>
        </div>
      </div>

      {hasValidClientId ? (
        /* Real PayPal Sandbox Buttons Container */
        <div className="space-y-2">
          <div id="paypal-button-container" className="min-h-[50px] relative z-10" />
          {!isScriptLoaded && !loadError && (
            <div className="w-full h-11 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse flex items-center justify-center text-xs text-slate-400 font-medium">
              Loading PayPal Sandbox Buttons...
            </div>
          )}
        </div>
      ) : (
        /* Setup Guidance & Instant Demo Simulator */
        <div className="p-4 rounded-2xl border-2 border-dashed border-indigo-300 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/20 space-y-3">
          <div className="flex items-start gap-2.5">
            <div className="p-1.5 rounded-lg bg-indigo-600 text-white mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <h5 className="font-bold text-xs text-indigo-950 dark:text-indigo-200">
                PayPal Sandbox Ready to Connect
              </h5>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                Add your <strong>Sandbox Client ID</strong> to <code className="bg-white dark:bg-slate-800 px-1 py-0.5 rounded font-mono text-[10px]">.env.local</code> and <code className="bg-white dark:bg-slate-800 px-1 py-0.5 rounded font-mono text-[10px]">backend/.env</code> to render live PayPal buttons.
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-indigo-200 dark:border-indigo-900/60">
            <button
              type="button"
              disabled={isProcessing}
              onClick={handleSimulateSandboxSuccess}
              className="w-full py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Simulate Sandbox PayPal Approval (${usdAmount} USD)</span>
            </button>
            <span className="block text-[10px] text-center text-slate-400 mt-1.5">
              (Executes complete order persistence & payment recording in MySQL)
            </span>
          </div>
        </div>
      )}

      {/* Security Disclaimer */}
      <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 font-medium pt-1 text-center">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
        <span>PayPal Sandbox Environment • Encrypted 256-bit TLS Connection</span>
      </div>
    </div>
  );
}

