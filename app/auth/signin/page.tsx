'use client';

import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { useState, Suspense } from 'react';
import { LogIn, Mail, Lock, ShieldCheck, User, Loader2 } from 'lucide-react';

function SignInForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await signIn('credentials', {
        email,
        password,
        callbackUrl,
        redirect: false,
      });
      if (res?.error) {
        setError(res.error === 'CredentialsSignin' ? 'Invalid credentials' : 'Failed to connect to server');
        setLoading(false);
      } else {
        window.location.href = callbackUrl;
      }
    } catch (err) {
      setError('An unexpected error occurred');
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
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome Back</h1>
          <p className="text-slate-500 text-sm mt-1">Sign in to manage your sheets</p>
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
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
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
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
                  required
                />
              </div>
            </div>

            {error && <p className="text-red-500 text-xs font-bold mt-2 ml-1 flex items-center gap-1">⚠️ {error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 dark:bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 dark:hover:bg-indigo-700 transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          <div className="my-8 flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-100 dark:bg-slate-700" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">or</span>
            <div className="flex-1 h-px bg-slate-100 dark:bg-slate-700" />
          </div>

          <button
            onClick={() => signIn('google', { callbackUrl })}
            className="w-full flex items-center justify-center gap-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 py-4 rounded-2xl font-bold hover:bg-slate-50 dark:hover:bg-slate-600 transition shadow-sm"
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
              onClick={() => { setEmail('admin@sheetsync.com'); setPassword('admin123'); }}
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
