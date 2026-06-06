import Link from 'next/link';
import { AnimatedSection, AnimatedFadeIn } from '@/components/AnimatedSection';
import { Table2, Share2, BarChart3, Download, Globe, Zap, ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

async function getFeaturedSheets() {
  const supabase = await createClient();
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-40">
          <div className="text-center max-w-4xl mx-auto">
            <AnimatedFadeIn>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-sm font-bold mb-8 border border-indigo-100 dark:border-indigo-800">
                <Zap className="w-4 h-4" /> Now with Product Tables support
              </div>
              <h1 className="text-5xl sm:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-8">
                Turn Google Sheets into<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">Professional Web Apps</span>
              </h1>
            </AnimatedFadeIn>
            <AnimatedFadeIn delay={0.1}>
              <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed mb-12 max-w-2xl mx-auto">
                SheetSync converts your spreadsheets into SEO-friendly webpages, embeddable widgets, JSON APIs, and visual dashboards. Zero coding required.
              </p>
            </AnimatedFadeIn>
            <AnimatedFadeIn delay={0.2}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/dashboard" className="inline-flex items-center justify-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all hover:scale-105 active:scale-95 text-lg shadow-xl shadow-indigo-200 dark:shadow-none">
                  Get Started Free <ArrowRight className="w-5 h-5" />
                </Link>
                <Link href="/explore" className="inline-flex items-center justify-center gap-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-8 py-4 rounded-2xl font-bold border border-slate-200 dark:border-slate-700 hover:border-indigo-300 transition-all text-lg">
                  <Globe className="w-5 h-5" /> Explore Public Sheets
                </Link>
              </div>
            </AnimatedFadeIn>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-32 px-4">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection>
            <div className="text-center mb-20">
              <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-4">Everything you need</h2>
              <p className="text-xl text-slate-600 dark:text-slate-400">From spreadsheet to production in minutes</p>
            </div>
          </AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Table2, title: 'Auto Table View', desc: 'Instant, sortable tables with virtual scrolling for 100k+ rows.' },
              { icon: Share2, title: 'Embed Anywhere', desc: 'Iframe or JS snippet — embed in Notion, Webflow, WordPress.' },
              { icon: BarChart3, title: 'Charts & Dashboards', desc: 'Auto-generated visualizations from your numeric columns.' },
              { icon: Download, title: 'JSON & CSV APIs', desc: 'REST endpoints for your data. Filter, sort, paginate.' },
            ].map((f, i) => (
              <AnimatedSection key={i} delay={i * 0.1}>
                <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-8 hover:shadow-2xl hover:border-indigo-300 dark:hover:border-indigo-600 transition-all duration-300 h-full">
                  <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center mb-6">
                    <f.icon className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{f.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{f.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-32 px-4 bg-slate-50 dark:bg-slate-800/50">
        <div className="max-w-5xl mx-auto">
          <AnimatedSection>
            <div className="text-center mb-20">
              <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-4">How it works</h2>
              <p className="text-xl text-slate-600 dark:text-slate-400">Three steps. No code.</p>
            </div>
          </AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { step: '01', title: 'Connect Sheet', desc: 'Paste your Google Sheet URL. We handle authentication and read access.' },
              { step: '02', title: 'Choose Layout', desc: 'Pick from table, cards, products, or comparison views. Auto-detected.' },
              { step: '03', title: 'Publish & Share', desc: 'Get a public URL, embed code, and JSON/CSV API endpoints instantly.' },
            ].map((s, i) => (
              <AnimatedSection key={i} delay={i * 0.15}>
                <div className="text-center">
                  <div className="text-6xl font-black text-indigo-100 dark:text-indigo-900/50 mb-6">{s.step}</div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">{s.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{s.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Featured */}
      {featured.length > 0 && (
        <section className="py-32 px-4">
          <div className="max-w-7xl mx-auto">
            <AnimatedSection>
              <div className="text-center mb-16">
                <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-4">Featured Sheets</h2>
                <p className="text-xl text-slate-600 dark:text-slate-400">See what others have built</p>
              </div>
            </AnimatedSection>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featured.map((sheet) => (
                <Link key={sheet.id} href={`/@${sheet.profiles?.username || 'user'}/${sheet.slug}`} className="group bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-8 hover:shadow-2xl transition-all duration-300">
                    <div className="flex items-center justify-between mb-6">
                        <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
                            <Table2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{sheet.row_count} rows</span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2 mb-4">{sheet.title}</h3>
                    <div className="pt-6 border-t border-slate-100 dark:border-slate-700 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700" />
                        <span className="text-sm font-medium text-slate-500">by @{sheet.profiles?.username || 'anonymous'}</span>
                    </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-32 px-4">
        <div className="max-w-5xl mx-auto bg-indigo-600 dark:bg-indigo-900 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-400/20 rounded-full -ml-32 -mb-32 blur-3xl" />
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-8 relative z-10">Ready to publish your data?</h2>
          <p className="text-xl text-indigo-100 mb-12 max-w-xl mx-auto relative z-10 leading-relaxed">Connect your Google Sheet and start sharing interactive apps with your audience in minutes.</p>
          <Link href="/dashboard" className="inline-block bg-white text-indigo-600 px-12 py-5 rounded-2xl font-bold hover:bg-indigo-50 transition-all hover:scale-105 active:scale-95 duration-300 text-lg shadow-xl relative z-10">
            Get Started for Free
          </Link>
        </div>
      </section>
    </div>
  );
}