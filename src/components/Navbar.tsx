'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { signInWithGoogle } from '@/lib/googleAuth';
import { Menu, X, Table2, LogOut, LayoutDashboard, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const { user, profile, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/" className="flex items-center gap-2">
              <Table2 className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
              <span className="text-xl font-bold text-slate-900 dark:text-white">SheetSync</span>
            </Link>

            <div className="hidden md:flex items-center gap-6">
              <Link href="/explore" className="text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium">Explore</Link>
              {user && (
                <>
                  <Link href="/dashboard" className="text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium flex items-center gap-1">
                    <LayoutDashboard className="w-4 h-4" /> Dashboard
                  </Link>
                  {profile?.role === 'admin' && (
                    <Link href="/admin" className="text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium flex items-center gap-1">
                      <Shield className="w-4 h-4" /> Admin
                    </Link>
                  )}
                </>
              )}
              {user ? (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">{profile?.display_name || user.email}</span>
                  {profile?.avatar_url && (
                    <img src={profile.avatar_url} alt="" className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700" />
                  )}
                  <button onClick={() => signOut()} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition" title="Sign Out">
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <Link href="/auth/signin" className="bg-indigo-600 text-white px-5 py-2 rounded-xl font-semibold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 dark:shadow-none">
                  Sign In
                </Link>
              )}
            </div>

            <button className="md:hidden p-2 text-slate-600 dark:text-slate-300" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden"
            >
              <div className="px-4 py-4 space-y-4">
                <Link href="/explore" onClick={() => setMobileOpen(false)} className="block text-slate-600 dark:text-slate-300 font-medium">Explore</Link>
                {user ? (
                  <>
                    <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="block text-slate-600 dark:text-slate-300 font-medium">Dashboard</Link>
                    <button onClick={() => { signOut(); setMobileOpen(false); }} className="flex items-center gap-2 text-red-600 font-medium w-full text-left">
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </>
                ) : (
                  <Link href="/auth/signin" onClick={() => setMobileOpen(false)} className="block w-full bg-indigo-600 text-white px-4 py-3 rounded-xl font-semibold text-center">Sign In</Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
}