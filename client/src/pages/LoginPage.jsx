import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { HeartHandshake, Sparkles, LogIn, ArrowRight, ShieldCheck } from 'lucide-react';

export const LoginPage = ({ setTab }) => {
  const { login, demoLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await login(email, password);
    if (res.success) {
      setTab('dashboard');
    } else {
      setError(res.message);
    }
    setLoading(false);
  };

  const handleDemoClick = async (role) => {
    setLoading(true);
    setError('');
    const res = await demoLogin(role);
    if (res.success) {
      setTab('dashboard');
    } else {
      setError(res.message);
    }
    setLoading(false);
  };

  return (
    <div className="py-12 max-w-md mx-auto animate-in fade-in duration-300">
      {/* Brand Header */}
      <div className="text-center space-y-2 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-saylani-600 to-saylani-400 flex items-center justify-center mx-auto shadow-lg shadow-saylani-500/25">
          <HeartHandshake className="w-7 h-7 text-slate-950 font-bold" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Welcome to ImpactHub
        </h2>
        <p className="text-xs text-slate-400">
          Sign in to collaborate on community projects and track volunteer points.
        </p>
      </div>

      {/* 1-Click Fast Demo Login Box */}
      <div className="glass-panel p-4 rounded-2xl border border-amber-500/40 space-y-3 mb-6">
        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-wider">
          <Sparkles className="w-4 h-4" />
          <span>Hackathon 1-Click Instant Demo Logins</span>
        </div>
        <p className="text-[11px] text-slate-400">
          Click any role below for instant pre-authenticated login:
        </p>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => handleDemoClick('student')}
            className="p-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition-all text-center"
          >
            🎓 Student
          </button>
          <button
            type="button"
            onClick={() => handleDemoClick('manager')}
            className="p-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold transition-all text-center"
          >
            📋 Manager
          </button>
          <button
            type="button"
            onClick={() => handleDemoClick('admin')}
            className="p-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 text-xs font-bold transition-all text-center"
          >
            🛡️ Admin
          </button>
        </div>
      </div>

      {/* Standard Form */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@impacthub.pk"
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-saylani-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-saylani-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-saylani-500 hover:bg-saylani-400 text-slate-950 font-bold text-xs shadow-lg shadow-saylani-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            <LogIn className="w-4 h-4" />
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-800 text-xs text-slate-400">
          <span>Don't have an account yet? </span>
          <button
            onClick={() => setTab('register')}
            className="text-saylani-400 hover:text-saylani-300 font-bold"
          >
            Create an Account
          </button>
        </div>
      </div>
    </div>
  );
};
