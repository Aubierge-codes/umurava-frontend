"use client";
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, MoveRight, ArrowLeft, KeyRound } from 'lucide-react';
import { api, saveSession } from '@/lib/api';
import { getDashboardRedirectPath, getStoredUser, normalizeUser } from '@/lib/auth';
import { requestGoogleCredential } from '@/lib/google-auth';
import GoogleMark from '@/components/GoogleMark';
import GwizaBrandMark from '@/components/GwizaBrandMark';

export default function LoginPage() {
  const router = useRouter();
  const [authState, setAuthState] = useState<'login' | 'forgot' | 'reset'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await api.post('/api/auth/login', { email, password });
    setLoading(false);
    if (res.success) {
      saveSession(res.token as string, res.user as object);
      const user = getStoredUser() ?? normalizeUser(res.user);
      router.push(getDashboardRedirectPath(user?.role));
    } else {
      setError((res.message as string) || 'Login failed. Check your email and password.');
    }
  };

  const handleForgot = async () => {
    setError('');
    setLoading(true);
    const res = await api.post('/api/auth/forgot-password', { email });
    setLoading(false);
    if (res.success) {
      setSuccessMsg('Reset code sent! Check your email.');
      setAuthState('reset');
    } else {
      setError((res.message as string) || 'Could not send reset email.');
    }
  };

  const handleReset = async () => {
    setError('');
    setLoading(true);
    const res = await api.post('/api/auth/reset-password', { email, code: resetCode, newPassword });
    setLoading(false);
    if (res.success) {
      setSuccessMsg('Password reset! You can now log in.');
      setAuthState('login');
    } else {
      setError((res.message as string) || 'Invalid or expired code.');
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      const credential = await requestGoogleCredential(googleClientId);
      const res = await api.post('/api/auth/google', { credential });

      if (res.success) {
        saveSession(res.token as string, res.user as object);
        const user = getStoredUser() ?? normalizeUser(res.user);
        router.push(getDashboardRedirectPath(user?.role));
        return;
      }

      setError((res.message as string) || 'Google sign in failed. Please try again.');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Google sign in failed.';
      setError(message);
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4 py-12">
      <Link
        href="/"
        className="absolute left-4 top-4 md:left-8 md:top-8 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-brand-dark shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
        aria-label="Back to landing page"
      >
        <ArrowLeft size={16} />
        Back
      </Link>
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <GwizaBrandMark size={40} textClassName="text-2xl text-brand-blue" />
          </Link>
          <h1 className="text-3xl font-extrabold text-brand-accent">
            {authState === 'login' && 'Welcome back.'}
            {authState === 'forgot' && 'Reset password'}
            {authState === 'reset' && 'Enter code'}
          </h1>
          <p className="text-slate-500 mt-2">
            {authState === 'login' && 'Log in to manage your recruitment pipeline.'}
            {authState === 'forgot' && 'Enter your email to receive a reset code.'}
            {authState === 'reset' && "We've sent a 6-digit code to your email."}
          </p>
        </div>

        <div className="bg-white p-8 rounded-[24px] shadow-xl shadow-blue-900/5 border border-slate-100">
          {authState === 'login' && (
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-brand-dark mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-brand-blue focus:ring-4 focus:ring-blue-50 transition-all text-brand-dark" />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-semibold text-brand-dark">Password</label>
                  <button type="button" onClick={() => { setError(''); setAuthState('forgot'); }}
                    className="text-sm font-semibold text-brand-blue hover:underline">Forgot?</button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-brand-blue focus:ring-4 focus:ring-blue-50 transition-all text-brand-dark" />
                </div>
              </div>
              {successMsg && <p className="text-green-600 text-sm text-center font-medium">{successMsg}</p>}
              {error && <p className="text-red-500 text-sm text-center font-medium">{error}</p>}
              <button type="submit" disabled={loading}
                className="w-full bg-brand-blue text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 disabled:opacity-60">
                {loading ? 'Logging in...' : 'Log In'} <MoveRight size={20} />
              </button>
            </form>
          )}

          {authState === 'forgot' && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-brand-dark mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-brand-blue focus:ring-4 focus:ring-blue-50 transition-all text-brand-dark" />
                </div>
              </div>
              {error && <p className="text-red-500 text-sm text-center">{error}</p>}
              <button onClick={handleForgot} disabled={loading}
                className="w-full bg-brand-blue text-white py-4 rounded-xl font-bold text-lg hover:bg-slate-800 transition-all shadow-lg disabled:opacity-60">
                {loading ? 'Sending...' : 'Send Reset Code'}
              </button>
              <button onClick={() => setAuthState('login')}
                className="w-full flex items-center justify-center gap-2 text-slate-500 font-semibold text-sm hover:text-brand-dark transition-colors">
                <ArrowLeft size={16} /> Back to Login
              </button>
            </div>
          )}

          {authState === 'reset' && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-brand-dark mb-2">6-Digit Code</label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input type="text" maxLength={6} value={resetCode} onChange={(e) => setResetCode(e.target.value)}
                    placeholder="000000"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-brand-blue focus:ring-4 focus:ring-blue-50 transition-all text-brand-dark tracking-[0.5em] font-mono" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-brand-dark mb-2">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 8 chars, e.g. Hello@123"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-brand-blue focus:ring-4 focus:ring-blue-50 transition-all text-brand-dark" />
                </div>
              </div>
              {error && <p className="text-red-500 text-sm text-center">{error}</p>}
              <button onClick={handleReset} disabled={loading}
                className="w-full bg-brand-blue text-white py-4 rounded-xl font-bold text-lg hover:bg-slate-800 transition-all shadow-lg disabled:opacity-60">
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
              <button onClick={() => setAuthState('forgot')}
                className="w-full text-slate-500 font-semibold text-sm hover:text-brand-dark transition-colors text-center">
                Resend code
              </button>
            </div>
          )}

          {authState === 'login' && (
            <>
              <div className="relative my-8 text-center">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
                <span className="relative bg-white px-4 text-xs font-bold text-slate-400 uppercase tracking-widest">or continue with</span>
              </div>
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={googleLoading || !googleClientId}
                className="w-full border border-slate-200 py-3 rounded-xl font-semibold text-brand-dark flex items-center justify-center gap-3 hover:bg-slate-50 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <GoogleMark />
                {googleLoading ? 'Connecting...' : 'Sign in with Google'}
              </button>
            </>
          )}
        </div>
        <p className="text-center mt-8 text-slate-600 font-medium">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-brand-blue font-bold hover:underline">Sign up for free</Link>
        </p>
      </div>
    </main>
  );
}
