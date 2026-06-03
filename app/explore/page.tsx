import Link from 'next/link';
import { createServerClient } from '@/lib/supabase-server';
import { Table2, ArrowRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

async function getPublicSheets() {
  const supabase = createServerClient();
  const { data } = await supabase
    .from('sheets')
    .select('*, profiles(username, display_name)')
    .eq('is_public', true)
    .order('created_at', { ascending: false });
  return data || [];
}

export default async function Explore() {
  const sheets = await getPublicSheets();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">Explore Public Sheets</h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 mt-2 font-medium">Discover datasets published by our community</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sheets.map((sheet) => (
            <Link
              key={sheet.id}
              href={`/@${sheet.profiles?.username || 'user'}/${sheet.slug}`}
              className="group bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-8 hover:shadow-2xl hover:border-indigo-500/50 transition-all duration-300 flex flex-col h-full shadow-sm"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Table2 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-slate-400">
                  {sheet.row_count} Rows
                </div>
              </div>

              <h2 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2 mb-2">
                {sheet.title}
              </h2>

              <p className="text-slate-500 font-medium text-sm flex-1">
                by @{sheet.profiles?.username || 'anonymous'}
              </p>

              <div className="mt-8 flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                View Sheet <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>

        {sheets.length === 0 && (
          <div className="text-center py-40">
            <h3 className="text-xl font-bold text-slate-400">No public sheets yet</h3>
          </div>
        )}
      </div>
    </div>
  );
}
