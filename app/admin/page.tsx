'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { Users, Table2, CreditCard, Activity, ArrowLeft, Shield } from 'lucide-react';

export default function Admin() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [sheets, setSheets] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'sheets' | 'transactions'>('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || profile?.role !== 'admin') return;
    const fetchData = async () => {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      const headers = { 'Authorization': `Bearer ${token}` };
      const [statsRes, usersRes, sheetsRes, transRes] = await Promise.all([
        fetch('/api/admin?metric=stats', { headers }),
        fetch('/api/admin?metric=users', { headers }),
        fetch('/api/admin?metric=sheets', { headers }),
        fetch('/api/admin?metric=transactions', { headers }),
      ]);
      setStats(await statsRes.json());
      setUsers(await usersRes.json());
      setSheets(await sheetsRes.json());
      setTransactions(await transRes.json());
      setLoading(false);
    };
    fetchData();
  }, [user, profile]);

  if (!user || profile?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <Shield className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Access Denied</h2>
          <p className="text-slate-600 dark:text-slate-400 mt-2">Admin access required.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button onClick={() => router.push('/dashboard')} className="flex items-center gap-2 text-slate-600 dark:text-slate-400 mb-6 hover:text-indigo-600">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">Admin Dashboard</h1>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl h-32 animate-pulse" />)}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[
                { label: 'Users', value: stats?.users || 0, icon: Users, color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' },
                { label: 'Sheets', value: stats?.sheets || 0, icon: Table2, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' },
                { label: 'Transactions', value: stats?.transactions || 0, icon: CreditCard, color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20' },
                { label: 'Analytics Events', value: stats?.analytics || 0, icon: Activity, color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20' },
              ].map((s, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                  <div className={`w-10 h-10 rounded-lg ${s.color} flex items-center justify-center mb-3`}>
                    <s.icon className="w-5 h-5" />
                  </div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{s.value}</p>
                  <p className="text-sm text-slate-500">{s.label}</p>
                </motion.div>
              ))}
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="flex border-b border-slate-200 dark:border-slate-700">
                {(['overview', 'users', 'sheets', 'transactions'] as const).map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-3 text-sm font-medium capitalize ${activeTab === tab ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>
                    {tab}
                  </button>
                ))}
              </div>
              <div className="p-6">
                {activeTab === 'overview' && (
                  <div className="space-y-4">
                    <p className="text-slate-600 dark:text-slate-400">Platform overview and key metrics.</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-xl">
                        <p className="text-sm text-slate-500">Total Rows Synced</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats?.rows || 0}</p>
                      </div>
                      <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-xl">
                        <p className="text-sm text-slate-500">Storage Usage</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{(users.length * 0.5 + sheets.length * 0.1).toFixed(1)} MB</p>
                      </div>
                    </div>
                  </div>
                )}
                {activeTab === 'users' && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 dark:bg-slate-700">
                        <tr><th className="px-4 py-3">Username</th><th className="px-4 py-3">Display Name</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Premium</th><th className="px-4 py-3">Joined</th></tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                        {users.map((u: any) => (
                          <tr key={u.id}><td className="px-4 py-3">{u.username}</td><td className="px-4 py-3">{u.display_name || '—'}</td><td className="px-4 py-3 capitalize">{u.role}</td><td className="px-4 py-3">{u.is_premium ? 'Yes' : 'No'}</td><td className="px-4 py-3">{new Date(u.created_at).toLocaleDateString()}</td></tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {activeTab === 'sheets' && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 dark:bg-slate-700">
                        <tr><th className="px-4 py-3">Title</th><th className="px-4 py-3">Owner</th><th className="px-4 py-3">Rows</th><th className="px-4 py-3">Layout</th><th className="px-4 py-3">Public</th></tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                        {sheets.map((s: any) => (
                          <tr key={s.id}><td className="px-4 py-3">{s.title}</td><td className="px-4 py-3">{s.profiles?.username}</td><td className="px-4 py-3">{s.row_count || 0}</td><td className="px-4 py-3 capitalize">{s.layout_type}</td><td className="px-4 py-3">{s.is_public ? 'Yes' : 'No'}</td></tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {activeTab === 'transactions' && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 dark:bg-slate-700">
                        <tr><th className="px-4 py-3">Product</th><th className="px-4 py-3">Amount</th><th className="px-4 py-3">Phone</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Date</th></tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                        {transactions.map((t: any) => (
                          <tr key={t.id}><td className="px-4 py-3">{t.product_name}</td><td className="px-4 py-3">{t.amount}</td><td className="px-4 py-3">{t.phone_number}</td><td className="px-4 py-3 capitalize">{t.status}</td><td className="px-4 py-3">{new Date(t.created_at).toLocaleDateString()}</td></tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
