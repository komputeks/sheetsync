'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/providers/AuthProvider';
import { useSheets } from '@/hooks/useSheets';
import EmbedModal from '@/components/EmbedModal';
import { Plus, Trash2, ExternalLink, RefreshCw, Share2, Loader2, AlertCircle } from 'lucide-react';

export default function Dashboard() {
  const { user, profile } = useAuth();
  const { sheets, loading, error: sheetsError, createSheet, deleteSheet, fetchSheets } = useSheets();
  const router = useRouter();
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [embedSheet, setEmbedSheet] = useState<{ id: string; slug: string } | null>(null);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [form, setForm] = useState<{ title: string; spreadsheet_id: string; sheet_name: string; layout_type: 'table' | 'cards' | 'products' | 'comparison' }>({ title: '', spreadsheet_id: '', sheet_name: 'Sheet1', layout_type: 'table' });

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
    setCreating(true);
    setCreateError(null);

    const result = await createSheet(form);

    setCreating(false);

    if (result.ok) {
      setShowCreate(false);
      setForm({ title: '', spreadsheet_id: '', sheet_name: 'Sheet1', layout_type: 'table' });
    } else {
      setCreateError(result.error || 'Failed to create sheet');
    }
  };

  const handleSync = async (sheetId: string) => {
    setSyncing(sheetId);
    try {
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sheet_id: sheetId }),
      });
      if (res.ok) await fetchSheets();
    } catch (err) {
      console.error('Sync failed:', err);
    } finally {
      setSyncing(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this sheet and all its data?')) return;
    await deleteSheet(id);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-12">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white">Dashboard</h1>
            <p className="text-slate-500 mt-2 font-medium">Welcome back, {profile?.display_name || user.email}</p>
          </div>
          <button onClick={() => { setShowCreate(true); setCreateError(null); }} className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-indigo-700 transition flex items-center gap-2 shadow-lg shadow-indigo-200 dark:shadow-none">
            <Plus className="w-5 h-5" /> New Sheet
          </button>
        </div>

        {/* Error banner */}
        {sheetsError && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-200 dark:border-red-900/30 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <p className="text-red-700 dark:text-red-400 text-sm font-medium">{sheetsError}</p>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          </div>
        ) : sheets.length === 0 ? (
          <div className="text-center py-20">
            <h3 className="text-xl font-bold text-slate-400 mb-4">No sheets yet</h3>
            <button onClick={() => { setShowCreate(true); setCreateError(null); }} className="text-indigo-600 font-bold hover:underline">Create your first sheet →</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sheets.map((sheet) => (
              <div key={sheet.id} className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 hover:shadow-xl transition group">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white line-clamp-1">{sheet.title}</h3>
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full ${sheet.is_public ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'}`}>
                    {sheet.is_public ? 'Public' : 'Private'}
                  </span>
                </div>
                <div className="text-sm text-slate-500 mb-6">{sheet.row_count} rows • {sheet.layout_type} • Last synced: {sheet.last_synced_at ? new Date(sheet.last_synced_at).toLocaleDateString() : 'Never'}</div>
                <div className="flex gap-2">
                  <button onClick={() => router.push(`/@${profile?.username || 'user'}/${sheet.slug}`)} className="flex-1 flex items-center justify-center gap-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm font-medium transition">
                    <ExternalLink className="w-4 h-4" /> View
                  </button>
                  <button onClick={() => handleSync(sheet.id)} disabled={syncing === sheet.id} className="flex-1 flex items-center justify-center gap-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm font-medium transition disabled:opacity-50">
                    <RefreshCw className={`w-4 h-4 ${syncing === sheet.id ? 'animate-spin' : ''}`} /> {syncing === sheet.id ? 'Syncing' : 'Sync'}
                  </button>
                  <button onClick={() => setEmbedSheet({ id: sheet.id, slug: sheet.slug })} className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition">
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(sheet.id)} className="p-2.5 rounded-xl border border-red-200 dark:border-red-900/30 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Sheet Modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => !creating && setShowCreate(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white dark:bg-slate-800 rounded-3xl p-8 w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-700" onClick={e => e.stopPropagation()}>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Create New Sheet</h2>

              {createError && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-200 dark:border-red-900/30 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <p className="text-red-700 dark:text-red-400 text-sm font-medium">{createError}</p>
                </div>
              )}

              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Sheet Title</label>
                  <input
                    value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                    className="w-full mt-1 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition"
                    required
                    disabled={creating}
                    placeholder="My Product Catalog"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Spreadsheet ID or URL</label>
                  <input
                    value={form.spreadsheet_id}
                    onChange={e => setForm({ ...form, spreadsheet_id: e.target.value })}
                    placeholder="Paste Google Sheets URL or ID"
                    className="w-full mt-1 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition"
                    required
                    disabled={creating}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Sheet Tab Name</label>
                  <input
                    value={form.sheet_name}
                    onChange={e => setForm({ ...form, sheet_name: e.target.value })}
                    className="w-full mt-1 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition"
                    disabled={creating}
                    placeholder="Sheet1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Layout Type</label>
                  <select
                    value={form.layout_type}
                    onChange={e => setForm({ ...form, layout_type: e.target.value as 'table' | 'cards' | 'products' | 'comparison' })}
                    className="w-full mt-1 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition"
                    disabled={creating}
                  >
                    <option value="table">Table</option>
                    <option value="cards">Cards</option>
                    <option value="products">Products</option>
                    <option value="comparison">Comparison</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => { if (!creating) setShowCreate(false); }}
                    disabled={creating}
                    className="flex-1 py-3 rounded-xl font-bold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {creating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create Sheet'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {embedSheet && (
        <EmbedModal
          sheetId={embedSheet.id}
          username={profile?.username || 'user'}
          slug={embedSheet.slug}
          onClose={() => setEmbedSheet(null)}
        />
      )}
    </div>
  );
}
