import React, { useState } from 'react';
import { Shield, Lock, User, AlertCircle, HardHat } from 'lucide-react';
import { api } from '../lib/api';
import { User as UserType } from '../types';

interface LoginProps {
  onLoginSuccess: (user: UserType) => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Please enter your username.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await api.login(username, password);
      if (res.success && res.user) {
        onLoginSuccess(res.user);
      } else {
        setError(res.message || 'Invalid username or password.');
      }
    } catch (err) {
      setError('A system connection error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async (usr: string) => {
    setIsLoading(true);
    setError('');
    try {
      const res = await api.login(usr, 'siemens123');
      if (res.success && res.user) {
        onLoginSuccess(res.user);
      } else {
        setError(res.message || 'Quick login failed.');
      }
    } catch (err) {
      setError('System connection error.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="login_screen" className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      {/* Decorative High Speed Rail glowing tracks background effect */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 via-emerald-400 to-cyan-500 opacity-60"></div>
      <div className="absolute -left-48 -bottom-48 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl"></div>
      <div className="absolute -right-48 -top-48 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-400 mb-4 shadow-inner">
            <HardHat className="w-8 h-8" id="login_logo" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Egypt High-Speed Rail</h1>
          <p className="text-sm text-slate-400 mt-1">AFC Installation & Site Inspection Assistant</p>
          <div className="mt-3 inline-block px-3 py-1 bg-teal-950/40 border border-teal-800/30 rounded-full">
            <span className="text-xs text-teal-400 font-mono">Siemens Mobility Egypt</span>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-950/40 border border-red-800/30 text-red-200 rounded-xl flex items-start gap-3 text-sm animate-shake">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Username / اسم المستخدم</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. sayed or ahmed"
                disabled={isLoading}
                className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 text-white rounded-xl placeholder:text-slate-600 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all text-sm font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Password / كلمة المرور</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={isLoading}
                className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 text-white rounded-xl placeholder:text-slate-600 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all text-sm font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            id="login_btn"
            className="w-full py-3 px-4 bg-teal-500 hover:bg-teal-400 active:bg-teal-600 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-bold rounded-xl shadow-lg shadow-teal-500/15 hover:shadow-teal-400/25 transition-all text-sm flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <span className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <Shield className="w-4 h-4" />
                <span>Secure Access</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-8 border-t border-slate-800/80 pt-6">
          <p className="text-center text-xs text-slate-500 mb-4">Quick login for project testing:</p>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => handleQuickLogin('sayed')}
              disabled={isLoading}
              className="px-3 py-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 rounded-xl text-xs font-medium transition-all text-left flex flex-col justify-between"
            >
              <span className="text-teal-400 font-bold">Sayed Abdelgawad</span>
              <span className="text-[10px] text-slate-500 mt-1">Role: Administrator</span>
            </button>
            <button
              onClick={() => handleQuickLogin('ahmed')}
              disabled={isLoading}
              className="px-3 py-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 rounded-xl text-xs font-medium transition-all text-left flex flex-col justify-between"
            >
              <span className="text-teal-400 font-bold">Ahmed Kamel</span>
              <span className="text-[10px] text-slate-500 mt-1">Role: Engineer</span>
            </button>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-[10px] text-slate-600">Siemens Mobility Middle East & Africa. All Rights Reserved © 2026</p>
        </div>
      </div>
    </div>
  );
}
