import Link from 'next/link';
import { Book, Code, History, Map } from 'lucide-react';

export default function Docs() {
  const sections = [
    { title: 'User Manual', icon: Book, href: '/docs/changelog', desc: 'Everything you need to know to get started.' },
    { title: 'API Reference', icon: Code, href: '/docs/changelog', desc: 'JSON & CSV endpoints documentation.' },
    { title: 'Changelog', icon: History, href: '/docs/changelog', desc: 'Recent updates and architectural decisions.' },
    { title: 'Roadmap', icon: Map, href: '/docs/changelog', desc: 'The future of SheetSync.' },
  ];
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-12">Documentation</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sections.map((s, i) => (
            <Link key={i} href={s.href} className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 hover:shadow-xl transition group">
              <s.icon className="w-8 h-8 text-indigo-600 mb-4 group-hover:scale-110 transition-transform" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{s.title}</h2>
              <p className="text-slate-500 text-sm leading-relaxed">{s.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}