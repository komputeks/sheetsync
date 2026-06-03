import { createServerClient } from '@/lib/supabase-server';
import { getServerSession } from 'next-auth';
import { Users, FileSpreadsheet, Activity, AlertCircle, Settings, Layout, Database, ShieldCheck } from 'lucide-react';

export const dynamic = 'force-dynamic';

async function getAdminStats() {
  const supabase = createServerClient();
  const [users, sheets, syncs, errors] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact' }),
    supabase.from('sheets').select('id', { count: 'exact' }),
    supabase.from('sync_logs').select('id', { count: 'exact' }),
    supabase.from('sync_logs').select('*').eq('status', 'failed').limit(5),
  ]);

  return {
    userCount: users.count || 0,
    sheetCount: sheets.count || 0,
    syncCount: syncs.count || 0,
    recentErrors: errors.data || [],
  };
}

export default async function AdminDashboard() {
  const session = await getServerSession();
  const stats = await getAdminStats();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 hidden lg:block sticky top-16 h-[calc(100vh-64px)]">
        <div className="p-6">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-8">Management</h2>
          <nav className="space-y-2">
            {[
              { icon: Users, label: 'Users', active: true },
              { icon: FileSpreadsheet, label: 'Sheets' },
              { icon: Activity, label: 'Analytics' },
              { icon: AlertCircle, label: 'Error Logs' },
              { icon: Layout, label: 'Layouts' },
              { icon: Settings, label: 'Global Settings' },
              { icon: Database, label: 'Backups' },
            ].map((item, i) => (
              <button key={i} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${item.active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white'}`}>
                <item.icon className="w-4 h-4" /> {item.label}
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <header className="flex justify-between items-end mb-12">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Admin Console</h1>
              <p className="text-slate-500 font-medium mt-1">Full system overview and control panel.</p>
            </div>
            <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 px-4 py-2 rounded-xl border border-emerald-100 dark:border-emerald-800/30 text-xs font-bold">
              <ShieldCheck className="w-4 h-4" /> SYSTEM OPERATIONAL
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              { label: 'Total Users', value: stats.userCount, icon: Users, color: 'text-blue-600' },
              { label: 'Active Sheets', value: stats.sheetCount, icon: FileSpreadsheet, color: 'text-indigo-600' },
              { label: 'Sync Operations', value: stats.syncCount, icon: Activity, color: 'text-purple-600' },
            ].map((stat, i) => (
              <div key={i} className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-700 shadow-sm">
                <stat.icon className={`w-8 h-8 ${stat.color} mb-4`} />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                <h3 className="text-4xl font-black text-slate-900 dark:text-white mt-1">{stat.value}</h3>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Errors */}
            <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
              <div className="p-8 border-b border-slate-100 dark:border-slate-700">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Recent Sync Failures</h3>
              </div>
              <div className="p-4">
                {stats.recentErrors.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 font-medium italic">No recent errors detected.</div>
                ) : (
                  <div className="space-y-2">
                    {stats.recentErrors.map((err: any) => (
                      <div key={err.id} className="p-4 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/30">
                        <p className="text-sm font-bold text-red-700 dark:text-red-400">{err.message}</p>
                        <p className="text-[10px] text-red-500 mt-1 uppercase tracking-widest">{new Date(err.created_at).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-200 dark:border-slate-700 p-8 shadow-sm">
               <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-8">Quick Controls</h3>
               <div className="grid grid-cols-2 gap-4">
                  {[
                    'Disallow Registration',
                    'Maintenance Mode',
                    'Backup Database',
                    'Clear Global Cache',
                    'Update Env Vars',
                    'GitHub PAT Config'
                  ].map((action, i) => (
                    <button key={i} className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 transition duration-200">
                      {action}
                    </button>
                  ))}
               </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
