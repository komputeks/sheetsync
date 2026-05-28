import Link from 'next/link';
import { Search, Table2 } from 'lucide-react';
import { createServerClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

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
    <div className="min-h-screen bg-white dark:bg-slate-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Explore Sheets</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">Discover public spreadsheets from the community</p>
          </div>
        </div>

        {sheets.length === 0 ? (
          <div className="text-center py-20">
            <Table2 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400">No sheets found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sheets.map((sheet: any) => (
              <Link key={sheet.id} href={`/@${sheet.profiles?.username || 'user'}/${sheet.slug}`} className="block bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg transition">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{sheet.title}</h3>
                <p className="text-sm text-slate-500 mt-1">by {sheet.profiles?.display_name || sheet.profiles?.username || 'Anonymous'}</p>
                <div className="mt-4 flex items-center gap-4 text-sm text-slate-500">
                  <span>{sheet.row_count || 0} rows</span>
                  <span className="capitalize px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded-full text-xs">{sheet.layout_type}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
