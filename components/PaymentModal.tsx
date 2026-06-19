'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Phone, ShoppingCart, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import type { Sheet } from '@/lib/supabase';

interface PaymentModalProps {
  sheet: Sheet;
  productData?: Record<string, any>;
  onClose: () => void;
}

export default function PaymentModal({ sheet, productData, onClose }: PaymentModalProps) {
  const [phone, setPhone] = useState('');
  const [step, setStep] = useState<'form' | 'processing' | 'success' | 'failed'>('form');
  const [error, setError] = useState('');

  const handlePayment = async () => {
    if (!phone || phone.length < 9) {
      setError('Please enter a valid phone number');
      return;
    }
    setError('');
    setStep('processing');

    try {
      const res = await fetch('/api/lipia-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          amount: productData?.Price || productData?.price || 1,
          reference: `sheet_${sheet.id}_${Date.now()}`,
          api_key: sheet.owner_id,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStep('success');
        await fetch('/api/transactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sheet_id: sheet.id,
            product_name: productData?.Name || productData?.name || 'Product',
            amount: productData?.Price || productData?.price || 1,
            phone_number: phone,
            status: 'completed',
            reference: data.reference,
          }),
        });
      } else {
        setStep('failed');
      }
    } catch {
      setStep('failed');
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-indigo-600" /> Purchase
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"><X className="w-5 h-5" /></button>
        </div>

        <AnimatePresence mode="wait">
          {step === 'form' && (
            <motion.div key="form" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
              {productData && (
                <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
                  <p className="font-semibold text-slate-900 dark:text-white">{productData.Name || productData.name || 'Product'}</p>
                  <p className="text-emerald-600 dark:text-emerald-400 font-bold text-lg">{productData.Price || productData.price || 'Contact for price'}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">M-Pesa Phone Number</label>
                <div className="relative mt-1">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="254712345678" className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
              </div>
              <button onClick={handlePayment} className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition">
                Pay Now
              </button>
            </motion.div>
          )}

          {step === 'processing' && (
            <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-8">
              <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-300">Processing M-Pesa payment...</p>
              <p className="text-sm text-slate-500 mt-2">Check your phone for the STK push</p>
            </motion.div>
          )}

          {step === 'success' && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Payment Successful!</h3>
              <p className="text-slate-600 dark:text-slate-300">Thank you for your purchase.</p>
              <button onClick={onClose} className="mt-6 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700">Close</button>
            </motion.div>
          )}

          {step === 'failed' && (
            <motion.div key="failed" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="text-center py-8">
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Payment Failed</h3>
              <p className="text-slate-600 dark:text-slate-300">Please try again or contact support.</p>
              <button onClick={() => setStep('form')} className="mt-6 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700">Try Again</button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
