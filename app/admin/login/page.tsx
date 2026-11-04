'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Sparkles, ArrowRight } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        router.push('/admin');
        router.refresh();
      } else {
        setError(data.error || 'Invalid administrator password');
      }
    } catch {
      setError('Network error authenticating');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-stone-900 border border-[#D4AF37]/30 rounded-2xl p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <span className="text-[10px] tracking-[0.3em] uppercase text-[#D4AF37] font-semibold block">
            Jewellery Mate
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-white">
            Admin Portal Access
          </h1>
          <p className="text-xs text-stone-400">
            Enter administrator password to manage catalog, orders, and logistics.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-300 text-xs rounded-lg text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-stone-300 mb-1.5">
              Admin Password (Default: <code className="text-[#D4AF37]">admin</code>)
            </label>
            <input
              type="password"
              required
              autoFocus
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full text-sm py-3 px-4 rounded-xl bg-stone-800/80 border border-stone-700 text-white placeholder-stone-500 focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full py-3.5 bg-[#D4AF37] hover:bg-[#B38F24] text-stone-950 text-xs uppercase tracking-widest font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-40"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-stone-800 text-center">
          <a href="/" className="text-xs text-stone-500 hover:text-stone-300 transition-colors">
            ← Return to Jewellery Storefront
          </a>
        </div>
      </div>
    </div>
  );
}
