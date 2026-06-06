'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Copy, Check } from 'lucide-react';

interface EmbedModalProps { sheetId: string; username: string; slug: string; onClose: () => void; }

export default function EmbedModal({ sheetId, username, slug, onClose }: EmbedModalProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const [tab, setTab] = useState<'share' | 'embed' | 'api'>('share');
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const publicUrl = `${origin}/@${username}/${slug}`;
  const iframeCode = `<iframe src="${publicUrl}?embed=true" width="100%" height="600" frameborder="0" style="border-radius:12px;border:1px solid #e2e8f0;"></iframe>`;
  const jsonUrl = `${origin}/api/sheet-data?sheet_id=${sheetId}`;
  const csvUrl = `${origin}/api/sheet-data?sheet_id=${sheetId}&format=csv`;

  const copy = (text: string, key: string) => { navigator.clipboard.writeText(text); setCopied(key); setTimeout(() => setCopied(null), 2000); };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white dark:bg-slate-800 rounded-3xl p-8 w-full max-w-xl shadow-2xl border border-slate-200 dark:border-slate-700" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-8">
          <div><h2 className="text-2xl font-bold text-slate-900 dark:text-white">Share & Embed</h2><p className="text-slate-500 text-sm mt-1">Get link, embed code, or API endpoint</p></div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition"><X className="w-5 h-5 text-slate-400" /></button>
        </div>
        <div className="flex gap-2 mb-6 p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl">
          {(['share', 'embed', 'api'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === t ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              {t === 'share' ? 'Share Link' : t === 'embed' ? 'Embed' : 'API'}
            </button>
          ))}
        </div>
        <div className="min-h-[120px]">
          {tab === 'share' && (
            <div className="flex gap-2 p-1.5 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700">
              <input readOnly value={publicUrl} className="flex-1 px-3 py-2 bg-transparent text-slate-900 dark:text-white outline-none font-mono text-xs" />
              <button onClick={() => copy(publicUrl, 'share')} className="p-2 bg-slate-600 text-white rounded-xl hover:bg-slate-700">{copied === 'share' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}</button>
            </div>
          )}
          {tab === 'embed' && (
            <div className="flex gap-2 p-1.5 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700">
              <textarea readOnly value={iframeCode} rows={3} className="flex-1 px-3 py-2 bg-transparent text-slate-900 dark:text-white outline-none font-mono text-xs resize-none" />
              <button onClick={() => copy(iframeCode, 'iframe')} className="p-2 bg-slate-600 text-white rounded-xl hover:bg-slate-700 self-start">{copied === 'iframe' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}</button>
            </div>
          )}
          {tab === 'api' && (
            <div className="space-y-4">
              <div><label className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 block">JSON API</label>
                <div className="flex gap-2 p-1.5 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <input readOnly value={jsonUrl} className="flex-1 px-3 py-2 bg-transparent text-slate-900 dark:text-white outline-none font-mono text-xs" />
                  <button onClick={() => copy(jsonUrl, 'json')} className="p-2 bg-slate-600 text-white rounded-xl hover:bg-slate-700">{copied === 'json' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}</button>
                </div>
              </div>
              <div><label className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 block">CSV Download</label>
                <div className="flex gap-2 p-1.5 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <input readOnly value={csvUrl} className="flex-1 px-3 py-2 bg-transparent text-slate-900 dark:text-white outline-none font-mono text-xs" />
                  <button onClick={() => copy(csvUrl, 'csv')} className="p-2 bg-slate-600 text-white rounded-xl hover:bg-slate-700">{copied === 'csv' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}