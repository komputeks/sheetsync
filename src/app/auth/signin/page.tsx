'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { signInWithGoogle } from '@/lib/googleAuth';
import { Suspense } from 'react';
import { LogIn, Mail, Lock, ShieldCheck, User, Loader2 } from 'lucide-react';

function SignInForm() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';
  const errorParam = searchParams.get('error');
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(errorParam ? 'Authentication failed. Please try again.' : '');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (isSignUp) {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (signUpError) throw signUpError;
        setSuccess('Account created! Check your email to confirm, then sign in.');
        setIsSignUp(false);
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        // Auth cookie is set by @supabase/ssr browser client automatically
        // Use window.location for a full page reload so middleware picks up the new cookie
        window.location.href = redirect;
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Authentication failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full">
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-8 text-center border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-200 dark:shadow-none">
            <LogIn className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{isSignUp ? 'Create Account' : 'Welcome Back'}</h1>
          <p className="text-slate-500 text-sm mt-1">{isSignUp ? 'Sign up to get started' : 'Sign in to manage your sheets'}</p>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 block ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition"
                  required
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 block ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition"
                  required
                />
              </div>
            </div>
            {error && <p className="text-red-500 text-sm font-medium bg-red-50 dark:bg-red-900/10 p-3 rounded-xl">{error}</p>}
            {success && <p className="text-emerald-600 text-sm font-medium bg-emerald-50 dark:bg-emerald-900/10 p-3 rounded-xl">{success}</p>}
            <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white py-3.5 rounded-2xl font-bold hover:bg-indigo-700 transition flex items-center justify-center gap-2 disabled:opacity-50">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogIn className="w-5 h-5" />}
              {loading ? (isSignUp ? 'Creating account...' : 'Signing in...') : (isSignUp ? 'Create Account' : 'Sign In')}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={() => { setIsSignUp(!isSignUp); setError(''); setSuccess(''); }}
              className="text-sm text-indigo-600 hover:underline font-medium"
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-slate-700" /></div>
            <div className="relative flex justify-center text-xs"><span className="px-4 bg-white dark:bg-slate-800 text-slate-400 font-bold uppercase tracking-widest">or</span></div>
          </div>

          <button
            onClick={() => signInWithGoogle('SheetSync')}
            className="w-full flex items-center justify-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 py-4 rounded-2xl font-bold hover:bg-slate-50 dark:hover:bg-slate-600 transition shadow-sm"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
            Continue with Google
          </button>
        </div>

        <div className="p-8 bg-indigo-50 dark:bg-indigo-900/20 border-t border-slate-100 dark:border-slate-700">
          <h3 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" /> Demo Credentials
          </h3>
          <div className="grid grid-cols-1 gap-3">
            <button
              onClick={() => { setEmail('admin@sheetsync.com'); setPassword('admin123'); setIsSignUp(false); }}
              className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-xl border border-indigo-100 dark:border-indigo-800/50 text-left hover:border-indigo-300 transition"
            >
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Admin Account</p>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">admin@sheetsync.com</p>
              </div>
              <ShieldCheck className="w-4 h-4 text-indigo-500" />
            </button>
            <button
              onClick={() => { setEmail('user@sheetsync.com'); setPassword('user123'); }}
              className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-xl border border-indigo-100 dark:border-indigo-800/50 text-left hover:border-indigo-300 transition"
            >
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">User Account</p>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">user@sheetsync.com</p>
              </div>
              <User className="w-4 h-4 text-indigo-500" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignIn() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4 py-12">
      <Suspense fallback={<Loader2 className="w-8 h-8 animate-spin text-indigo-600" />}>
        <SignInForm />
      </Suspense>
    </div>
  );
}
