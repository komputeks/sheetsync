'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import SheetTable from '@/components/SheetTable';
import EmbedModal from '@/components/EmbedModal';
import PaymentModal from '@/components/PaymentModal';
import type { Sheet, SheetColumn, SheetRow } from '@/lib/supabase';
import { Share2, Download, BarChart3, Table2, ShoppingCart } from 'lucide-react';

export default function PublicSheet() {
  const params = useParams();
  const username = params.username as string;
  const slug = params.slug as string;
  const [sheet, setSheet] = useState<Sheet | null>(null);
  const [columns, setColumns] = useState<SheetColumn[]>([]);
  const [rows, setRows] = useState<SheetRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEmbed, setShowEmbed] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Record<string, any> | null>(null);
  const [view, setView] = useState<'table' | 'chart'>('table');

  useEffect(() => {
    if (!username || !slug) return;
    fetch(`/api/sheets?user=${encodeURIComponent(username)}&slug=${encodeURIComponent(slug)}`)
      .then(r => r.json())
      .then(async (sheetData) => {
        setSheet(sheetData);
        if (sheetData?.id) {
          const dataRes = await fetch(`/api/sheet-data?sheet_id=${sheetData.id}`);
          const data = await dataRes.json();
          setColumns(data.columns || []);
          setRows(data.rows || []);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [username, slug]);

  useEffect(() => {
    if (sheet?.id) {
      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sheet_id: sheet.id, event_type: 'page_view', metadata: { path: window.location.pathname } }),
      });
    }
  }, [sheet?.id]);

  const handleBuy = (productData: Record<string, any>) => {
    setSelectedProduct(productData);
    setShowPayment(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="animate-spin w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!sheet) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Sheet not found</h2>
          <p className="text-slate-600 dark:text-slate-400 mt-2">This sheet may be private or doesn&apos;t exist.</p>
        </div>
      </div>
    );
  }

  const isProducts = sheet.layout_type === 'products';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{sheet.title}</h1>
              <p className="text-slate-500 mt-1">by {sheet.profiles?.display_name || sheet.profiles?.username || username}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setView(view === 'table' ? 'chart' : 'table')} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200">
                {view === 'table' ? <BarChart3 className="w-4 h-4" /> : <Table2 className="w-4 h-4" />}
                {view === 'table' ? 'Charts' : 'Table'}
              </button>
              <button onClick={() => setShowEmbed(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200">
                <Share2 className="w-4 h-4" /> Share
              </button>
              <a href={`/api/sheet-data?sheet_id=${sheet.id}&format=csv`} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">
                <Download className="w-4 h-4" /> CSV
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {view === 'table' ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            {isProducts ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {rows.map((row, idx) => {
                  const data = row.data;
                  const imageCol = columns.find(c => c.type === 'image');
                  const nameCol = columns.find(c => c.name.toLowerCase().includes('name') || c.name.toLowerCase().includes('title'));
                  const priceCol = columns.find(c => c.type === 'currency' || c.name.toLowerCase().includes('price'));
                  return (
                    <div key={idx} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-lg transition">
                      {imageCol && data[imageCol.name] && (
                        <img src={data[imageCol.name]} alt="" className="w-full h-48 object-cover" loading="lazy" />
                      )}
                      <div className="p-5">
                        {nameCol && <h3 className="font-semibold text-slate-900 dark:text-white text-lg">{data[nameCol.name]}</h3>}
                        {priceCol && <p className="text-emerald-600 dark:text-emerald-400 font-bold text-xl mt-1">{data[priceCol.name]}</p>}
                        <div className="mt-3 space-y-1">
                          {columns.filter(c => c !== imageCol && c !== nameCol && c !== priceCol).map(col => (
                            <div key={col.name} className="flex justify-between text-sm">
                              <span className="text-slate-500">{col.name}</span>
                              <span className="text-slate-700 dark:text-slate-300">{String(data[col.name] || '—')}</span>
                            </div>
                          ))}
                        </div>
                        <button onClick={() => handleBuy(data)} className="w-full mt-4 flex items-center justify-center gap-2 bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition">
                          <ShoppingCart className="w-4 h-4" /> Buy Now
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <SheetTable columns={columns} rows={rows} layoutType={sheet.layout_type} />
            )}
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 text-center">
            <BarChart3 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Charts Coming Soon</h3>
            <p className="text-slate-600 dark:text-slate-400 mt-2">Chart visualization will be available after data sync with numeric columns.</p>
          </motion.div>
        )}
      </div>

      {showEmbed && sheet && (
        <EmbedModal sheetId={sheet.id} username={username || 'user'} slug={sheet.slug} onClose={() => setShowEmbed(false)} />
      )}
      {showPayment && sheet && (
        <PaymentModal sheet={sheet} productData={selectedProduct || undefined} onClose={() => { setShowPayment(false); setSelectedProduct(null); }} />
      )}
    </div>
  );
}
