'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Copy, Check } from 'lucide-react';

interface EmbedModalProps {
  sheetId: string;
  username: string;
  slug: string;
  onClose: () => void;
}

export default function EmbedModal({ sheetId, username, slug, onClose }: EmbedModalProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const publicUrl = `${origin}/@${username}/${slug}`;
  const iframeCode = `<iframe src="${publicUrl}?embed=1" width="100%" height="600" frameborder="0" style="border-radius:8px;border:1px solid #e2e8f0;"></iframe>`;
  const scriptCode = `<div id="sheetsync-${sheetId.slice(0, 8)}"></div><script src="${origin}/embed.js" data-sheet="${sheetId}" data-target="sheetsync-${sheetId.slice(0, 8)}"></script>`;
  const jsonUrl = `${origin}/api/sheet-data?sheet_id=${sheetId}`;
  const csvUrl = `${origin}/api/sheet-data?sheet_id=${sheetId}&format=csv`;

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Share & Embed</h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Public URL</label>
            <div className="flex gap-2 mt-1">
              <input readOnly value={publicUrl} className="flex-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-sm" />
              <button onClick={() => copy(publicUrl, 'url')} className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                {copied === 'url' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-600 dark:text-slate-400">iFrame Embed</label>
            <div className="flex gap-2 mt-1">
              <textarea readOnly value={iframeCode} rows={3} className="flex-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-sm font-mono text-xs" />
              <button onClick={() => copy(iframeCode, 'iframe')} className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                {copied === 'iframe' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Script Embed</label>
            <div className="flex gap-2 mt-1">
              <textarea readOnly value={scriptCode} rows={3} className="flex-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-sm font-mono text-xs" />
              <button onClick={() => copy(scriptCode, 'script')} className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                {copied === 'script' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400">JSON API</label>
              <div className="flex gap-2 mt-1">
                <input readOnly value={jsonUrl} className="flex-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-xs" />
                <button onClick={() => copy(jsonUrl, 'json')} className="px-2 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700">
                  {copied === 'json' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400">CSV Export</label>
              <div className="flex gap-2 mt-1">
                <input readOnly value={csvUrl} className="flex-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-xs" />
                <button onClick={() => copy(csvUrl, 'csv')} className="px-2 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700">
                  {copied === 'csv' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
