'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Copy, Check, ExternalLink, Code } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmbedModalProps {
  sheetId: string;
  username: string;
  slug: string;
  onClose: () => void;
}

export default function EmbedModal({ sheetId, username, slug, onClose }: EmbedModalProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const [tab, setTab] = useState<'share' | 'embed' | 'api'>('share');

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const publicUrl = `${origin}/@${username}/${slug}`;
  const iframeCode = `<iframe src="${publicUrl}?embed=true" width="100%" height="600" frameborder="0" style="border-radius:12px;border:1px solid #e2e8f0;box-shadow:0 10px 15px -3px rgba(0,0,0,0.1);"></iframe>`;
  const scriptCode = `<div id="sheetsync-${sheetId.slice(0, 8)}"></div>\n<script src="${origin}/embed.js" data-sheet="${sheetId}" data-target="sheetsync-${sheetId.slice(0, 8)}"></script>`;
  const jsonUrl = `${origin}/api/public/${username}/${slug}`;
  const csvUrl = `${origin}/api/sheet-data?sheet_id=${sheetId}&format=csv`;

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
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
        className="bg-white dark:bg-slate-800 rounded-3xl p-8 w-full max-w-xl shadow-2xl border border-slate-200 dark:border-slate-700"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Share & Connect</h2>
            <p className="text-slate-500 text-sm mt-1">Get your data out into the world.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"><X className="w-5 h-5" /></button>
        </div>

        <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-900/50 rounded-2xl mb-8">
          {(['share', 'embed', 'api'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "flex-1 py-2 rounded-xl text-sm font-bold capitalize transition-all",
                tab === t ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              )}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="space-y-6">
          {tab === 'share' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 block">Public Link</label>
                <div className="flex gap-2 p-1.5 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 focus-within:border-indigo-500 transition-colors">
                  <input readOnly value={publicUrl} className="flex-1 px-3 py-2 bg-transparent text-slate-900 dark:text-white outline-none font-medium text-sm" />
                  <button onClick={() => copy(publicUrl, 'url')} className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-bold text-sm flex items-center gap-2 transition">
                    {copied === 'url' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied === 'url' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
              <div className="pt-4">
                <a href={publicUrl} target="_blank" className="flex items-center justify-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold hover:underline">
                  Open in new tab <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          )}

          {tab === 'embed' && (
            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 block">iFrame Embed Code</label>
                <div className="relative group">
                  <textarea readOnly value={iframeCode} rows={4} className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-xs leading-relaxed resize-none" />
                  <button onClick={() => copy(iframeCode, 'iframe')} className="absolute top-2 right-2 p-2 bg-indigo-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                    {copied === 'iframe' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-2xl flex gap-3">
                <Info className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <p className="text-xs text-indigo-700 dark:text-indigo-300 leading-relaxed font-medium">
                  Embeds are theme-aware and responsive. They will automatically adjust to fit the container size on your website.
                </p>
              </div>
            </div>
          )}

          {tab === 'api' && (
            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 block">JSON REST API</label>
                <div className="flex gap-2 p-1.5 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <input readOnly value={jsonUrl} className="flex-1 px-3 py-2 bg-transparent text-slate-900 dark:text-white outline-none font-mono text-xs" />
                  <button onClick={() => copy(jsonUrl, 'json')} className="p-2 bg-slate-600 text-white rounded-xl hover:bg-slate-700">
                    {copied === 'json' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 block">CSV Download URL</label>
                <div className="flex gap-2 p-1.5 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <input readOnly value={csvUrl} className="flex-1 px-3 py-2 bg-transparent text-slate-900 dark:text-white outline-none font-mono text-xs" />
                  <button onClick={() => copy(csvUrl, 'csv')} className="p-2 bg-slate-600 text-white rounded-xl hover:bg-slate-700">
                    {copied === 'csv' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function Info(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
  )
}
