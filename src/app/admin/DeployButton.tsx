'use client';
import { useState } from 'react';
import { Rocket, Loader2, CheckCircle, XCircle } from 'lucide-react';

export default function DeployButton() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'failed'>('idle');
  const handleDeploy = async () => {
    setStatus('loading');
    try {
      const res = await fetch('/api/admin/deploy', { method: 'POST' });
      if (res.ok) setStatus('success'); else setStatus('failed');
    } catch { setStatus('failed'); }
    setTimeout(() => setStatus('idle'), 5000);
  };
  return (
    <button onClick={handleDeploy} disabled={status === 'loading'} className="p-4 bg-indigo-600 text-white rounded-2xl border border-indigo-500 text-xs font-bold hover:bg-indigo-700 transition duration-200 flex items-center justify-center gap-2">
      {status === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : status === 'success' ? <CheckCircle className="w-4 h-4" /> : status === 'failed' ? <XCircle className="w-4 h-4" /> : <Rocket className="w-4 h-4" />}
      {status === 'loading' ? 'Deploying...' : status === 'success' ? 'Deployed!' : status === 'failed' ? 'Failed' : 'Trigger Vercel Deploy'}
    </button>
  );
}