'use client';

import { useState, useEffect, use } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SheetTable from '@/components/SheetTable';
import EmbedModal from '@/components/EmbedModal';
import PaymentModal from '@/components/PaymentModal';
import type { Sheet, SheetColumn, SheetRow } from '@/lib/supabase';
import { Share2, Download, BarChart3, Table2, ShoppingCart } from 'lucide-react';

/** Safely extract a string from unknown row data */
function str(val: unknown): string {
  if (val === null || val === undefined) return '';
  return String(val);
}

export default function PublicSheet({ params }: { params: Promise<{ username: string; slug: string }> }) {
  const { username, slug } = use(params);
  const [sheet, setSheet] = useState<Sheet | null>(null);
  const [columns, setColumns] = useState<SheetColumn[]>([]);
  const [rows, setRows] = useState<SheetRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEmbed, setShowEmbed] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Record<string, unknown> | null>(null);
  const [view, setView] = useState<'table' | 'cards' | 'chart'>('table');

  useEffect(() => {
    if (!username || !slug) return;
    fetch(`/api/sheets?user=${encodeURIComponent(username)}&slug=${encodeURIComponent(slug)}`)
      .then(r => r.json())
      .then(async (sheetData: Sheet) => {
        if (sheetData?.id) {
          setSheet(sheetData);
          const dataRes = await fetch(`/api/sheet-data?sheet_id=${sheetData.id}`);
          const data = await dataRes.json();
          setColumns(data.columns || []);
          setRows(data.rows || []);
          if (sheetData.layout_type === 'cards' || sheetData.layout_type === 'products') {
            setView('cards');
          }
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [username, slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="animate-spin w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!sheet) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 gap-4">
        <Table2 className="w-16 h-16 text-slate-300" />
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Sheet not found</h2>
      </div>
    );
  }

  const isProducts = sheet.layout_type === 'products';
  const imageCol = columns.find(c => c.type === 'image');
  const nameCol = columns.find(c => c.name.toLowerCase().includes('name') || c.name.toLowerCase().includes('title'));
  const priceCol = columns.find(c => c.type === 'currency' || c.name.toLowerCase().includes('price'));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-2">{sheet.title}</h1>
          <p className="text-slate-500 font-medium">by @{(sheet.profiles as Record<string, string>)?.username || username} • {sheet.row_count} rows</p>
        </div>

        <div className="flex gap-2 mb-6 p-1 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 w-fit">
          {(['table', 'cards', 'chart'] as const).map(v => (
            <button key={v} onClick={() => setView(v)} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${view === v ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>

        <div className="flex gap-3 mb-6">
          <button onClick={() => setShowEmbed(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 text-sm font-medium transition">
            <Share2 className="w-4 h-4" /> Share
          </button>
          <a href={`/api/sheet-data?sheet_id=${sheet.id}&format=csv`} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 text-sm font-medium transition">
            <Download className="w-4 h-4" /> CSV
          </a>
        </div>

        <AnimatePresence mode="wait">
          {view === 'cards' ? (
            <motion.div key="cards" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {rows.map((row) => {
                const data = row.data;
                const imageUrl = imageCol ? str(data[imageCol.name]) : '';
                const nameVal = nameCol ? str(data[nameCol.name]) : '';
                const priceVal = priceCol ? str(data[priceCol.name]) : '';
                return (
                  <div key={row.id} className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-xl transition group">
                    {imageUrl && imageUrl.match(/^https?:\/\//) && (
                      <div className="aspect-square bg-slate-100 dark:bg-slate-700 overflow-hidden">
                        <img src={imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                      </div>
                    )}
                    <div className="p-6">
                      {nameCol && <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{nameVal || '—'}</h3>}
                      {priceCol && <p className="text-xl font-black text-indigo-600 dark:text-indigo-400">{priceVal}</p>}
                      <div className="mt-4 space-y-2">
                        {columns.filter(c => c !== imageCol && c !== nameCol && c !== priceCol).slice(0, 4).map(col => (
                          <div key={col.name}>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{col.name}</span>
                            <span className="block text-slate-700 dark:text-slate-300 text-sm">{str(data[col.name]) || '—'}</span>
                          </div>
                        ))}
                      </div>
                      {isProducts && (
                        <button
                          onClick={() => { setSelectedProduct(data); setShowPayment(true); }}
                          className="w-full mt-6 flex items-center justify-center gap-2 bg-slate-900 dark:bg-indigo-600 text-white py-3.5 rounded-2xl font-bold hover:bg-slate-800 dark:hover:bg-indigo-700 transition active:scale-95 shadow-md"
                        >
                          <ShoppingCart className="w-5 h-5" /> Buy Now
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </motion.div>
          ) : view === 'table' ? (
            <motion.div key="table" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <SheetTable columns={columns} rows={rows} layoutType={sheet.layout_type} />
            </motion.div>
          ) : (
            <motion.div key="charts" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-12 text-center shadow-sm">
              <BarChart3 className="w-20 h-20 text-slate-200 dark:text-slate-700 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Charts Coming Soon</h3>
              <p className="text-slate-600 dark:text-slate-400 mt-2">Auto-visualizations for numeric data.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {showEmbed && sheet && <EmbedModal sheetId={sheet.id} username={username} slug={sheet.slug} onClose={() => setShowEmbed(false)} />}
      {showPayment && sheet && <PaymentModal sheet={sheet} productData={selectedProduct || undefined} onClose={() => { setShowPayment(false); setSelectedProduct(null); }} />}
    </div>
  );
}
