'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Phone, ShoppingCart, CheckCircle, XCircle, Loader2, CreditCard } from 'lucide-react';
import type { Sheet } from '@/lib/supabase';

interface PaymentModalProps { sheet: Sheet; productData?: Record<string, unknown>; onClose: () => void; }

export default function PaymentModal({ sheet, productData, onClose }: PaymentModalProps) {
  const [phone, setPhone] = useState('');
  const [step, setStep] = useState<'form' | 'processing' | 'success' | 'failed'>('form');
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(60);
  const priceStr = String(productData?.Price || productData?.price || '0');
  const price = parseFloat(priceStr.replace(/[^0-9.]/g, '')) || 0;

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (step === 'processing' && countdown > 0) timer = setInterval(() => setCountdown(c => c - 1), 1000);
    else if (countdown === 0 && step === 'processing') { setStep('failed'); setError('Payment timeout.'); }
    return () => clearInterval(timer);
  }, [step, countdown]);

  const handlePayment = async () => {
    if (!phone || !/^254(7|1|0)\d{8}$/.test(phone)) { setError('Enter valid M-Pesa phone (e.g., 254712345678)'); return; }
    setError(''); setStep('processing'); setCountdown(60);
    try {
      const res = await fetch('/api/lipia-payment', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sheet_id: sheet.id, amount: price, phone, product_name: String(productData?.Name || 'Product') }) });
      const data = await res.json();
      if (res.ok && data.success) setTimeout(() => setStep('success'), 5000);
      else { setStep('failed'); setError(data.error || 'Payment failed.'); }
    } catch { setStep('failed'); setError('Something went wrong.'); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white dark:bg-slate-800 rounded-3xl p-8 w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-700" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6"><h2 className="text-2xl font-bold text-slate-900 dark:text-white">Checkout</h2><button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition"><X className="w-5 h-5 text-slate-400" /></button></div>
        <AnimatePresence mode="wait">
          {step === 'form' && (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
              <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Product</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white mt-1">{String(productData?.Name || 'Product')}</p>
                <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-2">KES {price.toLocaleString()}</p>
              </div>
              <div><label className="text-sm font-bold text-slate-600 dark:text-slate-400 mb-2 block">M-Pesa Phone Number</label>
                <div className="relative"><Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="254712345678" className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white" /></div>
              </div>
              {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
              <button onClick={handlePayment} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 transition flex items-center justify-center gap-2"><CreditCard className="w-5 h-5" /> Pay KES {price.toLocaleString()}</button>
            </motion.div>
          )}
          {step === 'processing' && (
            <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-8">
              <Loader2 className="w-16 h-16 text-indigo-600 animate-spin mx-auto mb-6" />
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Processing Payment</h3>
              <p className="text-slate-500">STK push sent to <span className="text-slate-900 dark:text-white font-bold">{phone}</span>. Enter your M-Pesa PIN.</p>
            </motion.div>
          )}
          {step === 'success' && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
              <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce"><CheckCircle className="w-12 h-12 text-emerald-500" /></div>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Order Confirmed!</h3>
              <p className="text-slate-500 font-medium px-8 mb-8">Your payment was successful.</p>
              <button onClick={onClose} className="w-full bg-slate-900 dark:bg-slate-800 text-white py-4 rounded-2xl font-bold transition hover:bg-slate-800">Close Receipt</button>
            </motion.div>
          )}
          {step === 'failed' && (
            <motion.div key="failed" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
              <div className="w-24 h-24 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-8"><XCircle className="w-12 h-12 text-red-500" /></div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Payment Cancelled</h3>
              <p className="text-slate-500 font-medium px-8 mb-10">{error || 'Something went wrong.'}</p>
              <button onClick={() => setStep('form')} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold transition">Try Again</button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}