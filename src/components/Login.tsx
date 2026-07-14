import React, { useState } from 'react';
import { ShieldCheck, User as UserIcon, Lock, Landmark, AlertCircle, Loader2 } from 'lucide-react';
import { User } from '../types';
import { apiLogin } from '../api';

interface LoginProps {
  onLoginSuccess: (token: string, user: User) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await apiLogin(username, password);
      onLoginSuccess(data.token, data.user);
    } catch (err: any) {
      setError(err.message || 'Server error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (userType: 'admin' | 'urga' | 'niharika') => {
    const credentials = {
      admin: { u: 'admin', p: 'admin123' },
      urga: { u: 'urga', p: 'urga123' },
      niharika: { u: 'niharika', p: 'niharika123' },
    };

    const target = credentials[userType];
    setUsername(target.u);
    setPassword(target.p);
    setError(null);
  };

  return (
    <div id="login-container" className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        
        {/* Brand Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-indigo-600 text-white mb-4 shadow-md shadow-indigo-100">
            <Landmark className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Primex Fee Management
          </h2>
          <p className="mt-1 text-sm text-slate-500 font-medium">
            Authorized Personnel Access Only
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div id="login-error-alert" className="flex items-start gap-3 bg-red-50 text-red-700 p-3 rounded-lg text-sm border border-red-100 animate-shake">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-500 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="username-input" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Username
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <UserIcon className="w-5 h-5" />
              </span>
              <input
                id="username-input"
                name="username"
                type="text"
                autoComplete="username"
                required
                className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 sm:text-sm transition-all bg-slate-50/50"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label htmlFor="password-input" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-5 h-5" />
              </span>
              <input
                id="password-input"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 sm:text-sm transition-all bg-slate-50/50"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            id="login-submit-btn"
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-lg shadow-indigo-100 disabled:opacity-75 transition-all cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In to Dashboard'
            )}
          </button>
        </form>

        {/* Quick Testing Login Badges */}
        <div className="pt-6 border-t border-slate-100 text-center">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Quick-Fill Credentials (Demo Roles)
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <button
              id="fill-admin-btn"
              onClick={() => handleQuickLogin('admin')}
              className="inline-flex items-center justify-center px-2.5 py-1.5 border border-slate-200 text-xs font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 mr-1" />
              Super Admin
            </button>
            <button
              id="fill-urga-btn"
              onClick={() => handleQuickLogin('urga')}
              className="inline-flex items-center justify-center px-2.5 py-1.5 border border-slate-200 text-xs font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <Landmark className="w-3.5 h-3.5 text-emerald-600 mr-1" />
              Urga Manager
            </button>
            <button
              id="fill-niharika-btn"
              onClick={() => handleQuickLogin('niharika')}
              className="inline-flex items-center justify-center px-2.5 py-1.5 border border-slate-200 text-xs font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <Landmark className="w-3.5 h-3.5 text-amber-600 mr-1" />
              Niharika Manager
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
