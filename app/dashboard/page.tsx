'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useSheets } from '@/hooks/useSheets';
import EmbedModal from '@/components/EmbedModal';
import { Plus, Trash2, ExternalLink, RefreshCw, Share2, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function Dashboard() {
  const { user, profile } = useAuth();
  const { sheets, loading, createSheet, deleteSheet, fetchSheets } = useSheets();
  const router = useRouter();
  const [showCreate, setShowCreate] = useState(false);
  const [embedSheet, setEmbedSheet] = useState<any>(null);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', spreadsheet_id: '', sheet_name: 'Sheet1', layout_type: 'table' });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Please sign in</h2>
          <p className="text-slate-600 dark:text-slate-400">You need to be logged in to access the dashboard.</p>
        </div>
      </div>
    );
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await createSheet(form);
    if (res.ok) {
      setShowCreate(false);
      setForm({ title: '', spreadsheet_id: '', sheet_name: 'Sheet1', layout_type: 'table' });
    }
  };

  const handleSync = async (sheetId: string) => {
    setSyncing(sheetId);
    const session = await supabase.auth.getSession();
    const sampleData = [
      { Name: 'Product A', Price: '$29.99', Category: 'Electronics', InStock: 'Yes', __sheet_sync_id: crypto.randomUUID() },
      { Name: 'Product B', Price: '$49.99', Category: 'Clothing', InStock: 'No', __sheet_sync_id: crypto.randomUUID() },
      { Name: 'Product C', Price: '$19.99', Category: 'Home', InStock: 'Yes', __sheet_sync_id: crypto.randomUUID() },
      { Name: 'Product D', Price: '$99.99', Category: 'Electronics', InStock: 'Yes', __sheet_sync_id: crypto.randomUUID() },
      { Name: 'Product E', Price: '$14.99', Category: 'Books', InStock: 'Yes', __sheet_sync_id: crypto.randomUUID() },
    ];
    await fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.data.session?.access_token}` },
      body: JSON.stringify({ sheet_id: sheetId, sample_data: sampleData }),
    });
    setSyncing(null);
    fetchSheets();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this sheet?')) return;
    await deleteSheet(id);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">Manage your spreadsheets</p>
          </div>
          <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition">
            <Plus className="w-4 h-4" /> New Sheet
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl h-48 animate-pulse" />)}
          </div>
        ) : sheets.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-300 dark:border-slate-600">
            <Plus className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">No sheets yet</h3>
            <p className="text-slate-600 dark:text-slate-400 mt-2">Create your first sheet to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sheets.map(sheet => (
              <motion.div key={sheet.id} layout className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg transition">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{sheet.title}</h3>
                    <p className="text-sm text-slate-500 mt-1">{sheet.row_count || 0} rows · {sheet.layout_type}</p>
                    <span className={`inline-block mt-2 px-2 py-1 rounded-full text-xs ${sheet.is_public ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                      {sheet.is_public ? 'Public' : 'Private'}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => handleSync(sheet.id)} disabled={syncing === sheet.id} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-400">
                      {syncing === sheet.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                    </button>
                    <button onClick={() => setEmbedSheet(sheet)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-400">
                      <Share2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(sheet.id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 flex gap-2">
                  <button onClick={() => router.push(`/@${profile?.username || 'user'}/${sheet.slug}`)} className="flex-1 flex items-center justify-center gap-1 text-sm text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 py-2 rounded-lg transition">
                    <ExternalLink className="w-3 h-3" /> View
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4" onClick={() => setShowCreate(false)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Connect Google Sheet</h2>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Sheet Title</label>
                  <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full mt-1 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white" required />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Spreadsheet ID or URL</label>
                  <input value={form.spreadsheet_id} onChange={e => setForm({ ...form, spreadsheet_id: e.target.value })} placeholder="Paste spreadsheet URL or ID" className="w-full mt-1 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white" required />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Sheet Name</label>
                  <input value={form.sheet_name} onChange={e => setForm({ ...form, sheet_name: e.target.value })} className="w-full mt-1 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Layout Type</label>
                  <select value={form.layout_type} onChange={e => setForm({ ...form, layout_type: e.target.value })} className="w-full mt-1 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white">
                    <option value="table">Table</option>
                    <option value="cards">Cards</option>
                    <option value="products">Products</option>
                    <option value="comparison">Comparison</option>
                  </select>
                </div>
                <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700">Create Sheet</button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {embedSheet && (
          <EmbedModal
            sheetId={embedSheet.id}
            username={profile?.username || 'user'}
            slug={embedSheet.slug}
            onClose={() => setEmbedSheet(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
