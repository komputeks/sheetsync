'use client';

import { useState, useEffect, use } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SheetTable from '@/components/SheetTable';
import EmbedModal from '@/components/EmbedModal';
import PaymentModal from '@/components/PaymentModal';
import type { Sheet, SheetColumn, SheetRow } from '@/lib/supabase';
import { Share2, Download, BarChart3, Table2, ShoppingCart, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function PublicSheet({ params }: { params: Promise<{ username: string, slug: string }> }) {
  const { username: rawUsername, slug } = use(params);
  const username = rawUsername.replace('%40', '');

  const [sheet, setSheet] = useState<Sheet | null>(null);
  const [columns, setColumns] = useState<SheetColumn[]>([]);
  const [rows, setRows] = useState<SheetRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEmbed, setShowEmbed] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [view, setView] = useState<'table' | 'chart' | 'cards'>('table');

  useEffect(() => {
    if (!username || !slug) return;
    fetch(`/api/sheets?user=${encodeURIComponent(username)}&slug=${encodeURIComponent(slug)}`)
      .then(r => r.json())
      .then(async (sheetData) => {
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

  const handleBuy = (productData: any) => {
    setSelectedProduct(productData);
    setShowPayment(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full" />
          <p className="text-slate-500 font-medium">Loading SheetSync...</p>
        </div>
      </div>
    );
  }

  if (!sheet) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 px-4">
        <div className="max-w-md w-full text-center bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700">
          <Info className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Sheet Not Found</h2>
          <p className="text-slate-600 dark:text-slate-400 mt-2">This sheet might be private or deleted.</p>
        </div>
      </div>
    );
  }

  const isProducts = sheet.layout_type === 'products';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-16 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{sheet.title}</h1>
                {isProducts && <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs font-bold px-2 py-1 rounded-full uppercase">Store</span>}
              </div>
              <p className="text-slate-500 mt-1 font-medium">by <span className="text-indigo-600 dark:text-indigo-400">@{sheet.profiles?.username || username}</span></p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
               <button
                onClick={() => setView(view === 'table' ? 'cards' : 'table')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition font-medium text-sm"
              >
                <Table2 className="w-4 h-4" />
                {view === 'table' ? 'Card View' : 'Table View'}
              </button>

              <button
                onClick={() => setView('chart')}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 transition font-medium text-sm",
                  view === 'chart' ? "bg-indigo-600 text-white border-indigo-600" : "hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
                )}
              >
                <BarChart3 className="w-4 h-4" /> Charts
              </button>

              <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-2 hidden sm:block" />

              <button
                onClick={() => setShowEmbed(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition font-medium text-sm"
              >
                <Share2 className="w-4 h-4" /> Share
              </button>

              <a
                href={`/api/sheet-data?sheet_id=${sheet.id}&format=csv`}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 dark:shadow-none font-bold text-sm"
              >
                <Download className="w-4 h-4" /> Export CSV
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <AnimatePresence mode="wait">
          {view === 'cards' || (view === 'table' && (sheet.layout_type === 'cards' || sheet.layout_type === 'products')) ? (
            <motion.div
              key="cards"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
            >
              {rows.map((row, idx) => {
                const data = row.data;
                const imageCol = columns.find(c => c.type === 'image');
                const nameCol = columns.find(c => c.name.toLowerCase().includes('name') || c.name.toLowerCase().includes('title'));
                const priceCol = columns.find(c => c.type === 'currency' || c.name.toLowerCase().includes('price'));

                return (
                  <div key={idx} className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-2xl transition-all duration-300 group flex flex-col h-full shadow-sm">
                    {imageCol && data[imageCol.name] && (
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <img
                          src={data[imageCol.name]}
                          alt={nameCol ? data[nameCol.name] : ''}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                      </div>
                    )}
                    <div className="p-6 flex flex-col flex-1">
                      {nameCol && <h3 className="font-bold text-slate-900 dark:text-white text-xl line-clamp-1">{data[nameCol.name]}</h3>}
                      {priceCol && <p className="text-indigo-600 dark:text-indigo-400 font-extrabold text-2xl mt-1">{data[priceCol.name]}</p>}

                      <div className="mt-6 space-y-3 flex-1">
                        {columns.filter(c => c !== imageCol && c !== nameCol && c !== priceCol).slice(0, 5).map(col => (
                          <div key={col.name} className="flex flex-col gap-0.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{col.name}</span>
                            <span className="text-slate-700 dark:text-slate-300 text-sm line-clamp-2">{String(data[col.name] || '—')}</span>
                          </div>
                        ))}
                      </div>

                      {isProducts && (
                        <button
                          onClick={() => handleBuy(data)}
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
            <motion.div
              key="table"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <SheetTable columns={columns} rows={rows} layoutType={sheet.layout_type} />
            </motion.div>
          ) : (
            <motion.div
              key="charts"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-12 text-center shadow-sm"
            >
              <BarChart3 className="w-20 h-20 text-slate-200 dark:text-slate-700 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Dynamic Charts Coming Soon</h3>
              <p className="text-slate-600 dark:text-slate-400 mt-2 max-w-sm mx-auto">We're building a powerful Recharts-based engine to automatically visualize your numeric data.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {showEmbed && <EmbedModal sheetId={sheet.id} username={username} slug={sheet.slug} onClose={() => setShowEmbed(false)} />}
      {showPayment && <PaymentModal sheet={sheet} productData={selectedProduct} onClose={() => { setShowPayment(false); setSelectedProduct(null); }} />}
    </div>
  );
}
