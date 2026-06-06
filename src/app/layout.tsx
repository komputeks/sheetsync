import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Providers } from '@/components/Providers';
import Navbar from '@/components/Navbar';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'SheetSync - Turn Google Sheets into Web Apps',
  description: 'Convert Google Sheets into SEO-friendly webpages, embeddable tables, JSON APIs, and visual dashboards.',
  keywords: ['google sheets', 'spreadsheet', 'web app', 'embed', 'api', 'csv', 'json'],
  authors: [{ name: 'SheetSync' }],
  openGraph: {
    title: 'SheetSync - Turn Google Sheets into Web Apps',
    description: 'Convert Google Sheets into SEO-friendly webpages, embeddable tables, JSON APIs, and visual dashboards.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#4f46e5',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 antialiased">
        <Providers>
          <Navbar />
          <main>
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full" /></div>}>
              {children}
            </Suspense>
          </main>
        </Providers>
      </body>
    </html>
  );
}