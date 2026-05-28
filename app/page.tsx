import Link from 'next/link';
import { AnimatedSection, AnimatedFadeIn } from '@/components/AnimatedSection';
import { Table2, Share2, BarChart3, Download, Globe, Zap, Shield, Code } from 'lucide-react';
import { createServerClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

async function getFeaturedSheets() {
  const supabase = createServerClient();
  const { data } = await supabase
    .from('sheets')
    .select('*, profiles(username, display_name)')
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(6);
  return data || [];
}

export default async function Home() {
  const featured = await getFeaturedSheets();

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center max-w-3xl mx-auto">
            <AnimatedFadeIn>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white tracking-tight">
                Turn Google Sheets into<br />
                <span className="text-indigo-600 dark:text-indigo-400">Powerful Web Apps</span>
              </h1>
            </AnimatedFadeIn>
            <AnimatedFadeIn delay={0.1}>
              <p className="mt-6 text-lg text-slate-600 dark:text-slate-300">
                SheetSync converts your spreadsheets into SEO-friendly webpages, embeddable tables, JSON APIs, and visual dashboards. No code required.
              </p>
            </AnimatedFadeIn>
            <AnimatedFadeIn delay={0.2}>
              <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/dashboard" className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30">
                  Get Started Free
                </Link>
                <Link href="/explore" className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-8 py-4 rounded-xl font-semibold border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition">
                  Explore Sheets
                </Link>
              </div>
            </AnimatedFadeIn>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Everything You Need</h2>
            <p className="mt-4 text-slate-600 dark:text-slate-400">Powerful features for modern data publishing</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Table2, title: 'Smart Tables', desc: 'Sort, filter, search, and paginate with TanStack Table.' },
              { icon: Share2, title: 'Embeddable Widgets', desc: 'Generate iframe and script embeds for any website.' },
              { icon: BarChart3, title: 'Auto Charts', desc: 'Visualize numeric data with Recharts automatically.' },
              { icon: Download, title: 'CSV & JSON API', desc: 'Export data or consume via REST API endpoints.' },
              { icon: Globe, title: 'SEO Optimized', desc: 'Server-rendered pages with structured data and OpenGraph.' },
              { icon: Shield, title: 'Secure & Scalable', desc: 'Row-level security, rate limiting, and caching built-in.' },
              { icon: Zap, title: 'Auto Sync', desc: 'Sync from Google Sheets every 30 minutes automatically.' },
              { icon: Code, title: 'Type Detection', desc: 'Smart column type detection for images, videos, currency, dates.' },
            ].map((f, i) => (
              <AnimatedSection key={i} delay={i * 0.05}>
                <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:shadow-lg transition">
                  <f.icon className="w-8 h-8 text-indigo-600 dark:text-indigo-400 mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{f.title}</h3>
                  <p className="mt-2 text-slate-600 dark:text-slate-400 text-sm">{f.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Sheets */}
      {featured.length > 0 && (
        <section className="py-20 bg-slate-50 dark:bg-slate-800/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Featured Sheets</h2>
              <p className="mt-4 text-slate-600 dark:text-slate-400">Discover what others are publishing</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map((sheet: any) => (
                <Link key={sheet.id} href={`/@${sheet.profiles?.username || 'user'}/${sheet.slug}`} className="group block bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-xl transition">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">{sheet.title}</h3>
                    <p className="mt-2 text-sm text-slate-500">by {sheet.profiles?.display_name || sheet.profiles?.username || 'Anonymous'}</p>
                    <div className="mt-4 flex items-center gap-4 text-sm text-slate-500">
                      <span>{sheet.row_count || 0} rows</span>
                      <span className="capitalize">{sheet.layout_type}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-20 bg-indigo-600 dark:bg-indigo-900">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white">Ready to publish your data?</h2>
          <p className="mt-4 text-indigo-100">Connect your Google Sheet and start sharing in minutes.</p>
          <Link href="/dashboard" className="mt-8 inline-block bg-white text-indigo-600 px-8 py-4 rounded-xl font-semibold hover:bg-indigo-50 transition">
            Start for Free
          </Link>
        </div>
      </section>
    </div>
  );
}
