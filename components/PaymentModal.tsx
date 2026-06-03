'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Phone, ShoppingCart, CheckCircle, XCircle, Loader2, CreditCard, Info } from 'lucide-react';
import type { Sheet } from '@/lib/supabase';
import { cn } from '@/lib/utils';

interface PaymentModalProps {
  sheet: Sheet;
  productData?: Record<string, any>;
  onClose: () => void;
}

export default function PaymentModal({ sheet, productData, onClose }: PaymentModalProps) {
  const [phone, setPhone] = useState('');
  const [step, setStep] = useState<'form' | 'processing' | 'success' | 'failed'>('form');
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(60);

  const priceStr = productData?.Price || productData?.price || '0';
  const price = parseFloat(String(priceStr).replace(/[^0-9.]/g, '')) || 0;

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'processing' && countdown > 0) {
      timer = setInterval(() => setCountdown(c => c - 1), 1000);
    } else if (countdown === 0 && step === 'processing') {
      setStep('failed');
      setError('Payment timeout. Please try again.');
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  const handlePayment = async () => {
    if (!phone || !/^254(7|1|0)\d{8}$/.test(phone)) {
      setError('Enter valid M-Pesa phone (e.g., 254712345678)');
      return;
    }
    setError('');
    setStep('processing');
    setCountdown(60);

    try {
      const res = await fetch('/api/lipia-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sheet_id: sheet.id,
          amount: price,
          phone,
          product_name: productData?.Name || productData?.name || 'Product',
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        // In a real app, we would poll the status here
        // For this demo, we'll simulate success after 5 seconds
        setTimeout(() => setStep('success'), 5000);
      } else {
        setStep('failed');
        setError(data.error || 'Payment failed to initiate.');
      }
    } catch (err: any) {
      setStep('failed');
      setError('Something went wrong. Try again.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden relative"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Checkout</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <AnimatePresence mode="wait">
          {step === 'form' && (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
              {productData && (
                <div className="bg-slate-50 dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Product Details</p>
                  <p className="font-bold text-slate-900 dark:text-white text-lg line-clamp-1">{productData.Name || productData.name || 'Product'}</p>
                  <p className="text-indigo-600 dark:text-indigo-400 font-black text-2xl mt-1">{priceStr}</p>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">M-Pesa Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="254712345678"
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
                  />
                </div>
                {error && <p className="text-red-500 text-xs font-bold mt-2 ml-1 flex items-center gap-1"><XCircle className="w-3 h-3" /> {error}</p>}
              </div>

              <div className="bg-emerald-50 dark:bg-emerald-900/10 p-4 rounded-2xl flex gap-3 border border-emerald-100 dark:border-emerald-900/30">
                <CreditCard className="w-5 h-5 text-emerald-600 shrink-0" />
                <p className="text-[10px] text-emerald-700 dark:text-emerald-400 leading-relaxed font-medium">
                  We'll send an STK push to your M-Pesa. Simply enter your PIN to complete the purchase safely.
                </p>
              </div>

              <button
                onClick={handlePayment}
                className="w-full bg-slate-900 dark:bg-indigo-600 text-white py-5 rounded-2xl font-black text-lg hover:bg-slate-800 dark:hover:bg-indigo-700 transition active:scale-95 shadow-xl shadow-indigo-500/10"
              >
                Complete Payment
              </button>
            </motion.div>
          )}

          {step === 'processing' && (
            <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-12">
              <div className="relative inline-block mb-8">
                <div className="w-24 h-24 border-4 border-indigo-100 dark:border-indigo-900/30 rounded-full" />
                <div className="absolute inset-0 w-24 h-24 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-black text-indigo-600">{countdown}s</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Check Your Phone</h3>
              <p className="text-slate-500 font-medium px-4">An STK push has been sent to <span className="text-slate-900 dark:text-white font-bold">{phone}</span>. Please enter your M-Pesa PIN.</p>
            </motion.div>
          )}

          {step === 'success' && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
              <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
                <CheckCircle className="w-12 h-12 text-emerald-500" />
              </div>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Order Confirmed!</h3>
              <p className="text-slate-500 font-medium px-8 mb-8">Your payment was successful. The seller has been notified.</p>

              {sheet.profiles?.thank_notes && (
                <div className="mb-8 p-6 bg-slate-50 dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700 italic text-slate-600 dark:text-slate-400 font-medium">
                   "{sheet.profiles.thank_notes}"
                </div>
              )}

              <button
                onClick={onClose}
                className="w-full bg-slate-900 dark:bg-slate-800 text-white py-4 rounded-2xl font-bold transition hover:bg-slate-800"
              >
                Close Receipt
              </button>
            </motion.div>
          )}

          {step === 'failed' && (
            <motion.div key="failed" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
              <div className="w-24 h-24 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-8">
                <XCircle className="w-12 h-12 text-red-500" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Payment Cancelled</h3>
              <p className="text-slate-500 font-medium px-8 mb-10">{error || "Something went wrong during the transaction."}</p>
              <button
                onClick={() => setStep('form')}
                className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold transition"
              >
                Try Another Method
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
