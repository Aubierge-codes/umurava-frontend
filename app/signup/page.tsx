"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, Building, MoveRight, CheckCircle2, KeyRound, ArrowLeft } from 'lucide-react';
import { api, saveSession } from '@/lib/api';
import { getDashboardRedirectPath, getStoredUser, normalizeUser } from '@/lib/auth';
import { requestGoogleCredential } from '@/lib/google-auth';
import GoogleMark from '@/components/GoogleMark';
import GwizaBrandMark from '@/components/GwizaBrandMark';

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState('signup');
  const [token, setToken] = useState('');
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    const res = await api.post('/api/auth/signup', { name, companyName, email, password });
    setLoading(false);
    if (res.success) {
      setStep('verify');
    } else {
      setError((res.message as string) || 'Signup failed. Please try again.');
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await api.post('/api/auth/verify-email', { email, code: token });
    setLoading(false);
    if (res.success) {
      saveSession(res.token as string, res.user as object);
      setStep('success');
      const user = getStoredUser() ?? normalizeUser(res.user);
      setTimeout(() => router.push(getDashboardRedirectPath(user?.role)), 2000);
    } else {
      setError((res.message as string) || 'Invalid code. Please try again.');
    }
  };

  const handleGoogleSignup = async () => {
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

  if (step === 'verify') {
    return (
      <main className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white p-10 rounded-[32px] shadow-xl border border-slate-100">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <KeyRound size={32} className="text-brand-blue" />
            </div>
            <h1 className="text-2xl font-black text-brand-dark">Enter Verification Code</h1>
            <p className="text-slate-500 mt-2 text-sm">We sent a 6-digit code to <strong>{email}</strong></p>
          </div>
          <form onSubmit={handleVerify} className="space-y-6">
            <input
              required
              type="text"
              maxLength={6}
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="0 0 0 0 0 0"
              className="w-full text-center text-2xl tracking-[1em] font-black py-4 rounded-2xl border-2 border-slate-100 outline-none focus:border-brand-blue transition-all text-brand-dark"
            />
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <button type="submit" disabled={loading} className="w-full bg-brand-blue text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-opacity-90 transition-all disabled:opacity-60">
              {loading ? 'Verifying...' : 'Verify Account'} <MoveRight size={20} />
            </button>
          </form>
        </div>
      </main>
    );
  }

  if (step === 'success') {
    return (
      <main className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white p-10 rounded-[32px] shadow-xl text-center border border-slate-100">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} className="text-green-500" />
          </div>
          <h1 className="text-2xl font-black text-brand-dark mb-2">Email Verified!</h1>
          <p className="text-slate-500 mb-4">Your account is active. Taking you to your dashboard...</p>
        </div>
      </main>
    );
  }

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
      <div className="max-w-xl w-full">
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <GwizaBrandMark size={40} textClassName="text-2xl text-brand-blue" />
          </Link>
          <h1 className="text-3xl font-extrabold text-brand-accent">Join the future of hiring.</h1>
          <p className="text-slate-500 mt-2">Create your account and start discovering top talent.</p>
        </div>

        <div className="bg-white p-8 md:p-10 rounded-[32px] shadow-xl shadow-blue-900/5 border border-slate-100">
          <form className="space-y-5" onSubmit={handleSignup}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-brand-dark mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input required type="text" placeholder="Name Surname" value={name} onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-brand-blue focus:ring-4 focus:ring-blue-50 transition-all text-brand-dark" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-brand-dark mb-2">Company Name</label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input type="text" placeholder="Company Ltd" value={companyName} onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-brand-blue focus:ring-4 focus:ring-blue-50 transition-all text-brand-dark" />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-brand-dark mb-2">Work Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input required type="email" placeholder="name@company.com" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-brand-blue focus:ring-4 focus:ring-blue-50 transition-all text-brand-dark" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-brand-dark mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input required type="password" placeholder="Min 8 chars, e.g. Hello@123" value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-brand-blue focus:ring-4 focus:ring-blue-50 transition-all text-brand-dark" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-brand-dark mb-2">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input required type="password" placeholder="Must match the password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-brand-blue focus:ring-4 focus:ring-blue-50 transition-all text-brand-dark" />
              </div>
            </div>
            <div className="flex items-start gap-3 py-2">
              <input required type="checkbox" className="mt-1 w-4 h-4 rounded border-slate-300 text-brand-blue focus:ring-brand-blue" />
              <span className="text-sm text-slate-600 font-medium leading-tight">
                I agree to the <Link href="#" className="text-brand-blue underline">Terms of Service</Link> and <Link href="#" className="text-brand-blue underline">Privacy Policy</Link>.
              </span>
            </div>
            {error && <p className="text-red-500 text-sm text-center font-medium">{error}</p>}
            <button type="submit" disabled={loading}
              className="w-full bg-brand-blue text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-opacity-90 transition-all shadow-lg shadow-blue-100 disabled:opacity-60">
              {loading ? 'Creating account...' : 'Create Account'} <MoveRight size={20} />
            </button>
          </form>
          <div className="relative my-8 text-center">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
            <span className="relative bg-white px-4 text-xs font-bold text-slate-400 uppercase tracking-widest">or sign up with</span>
          </div>
          <button
            type="button"
            onClick={handleGoogleSignup}
            disabled={googleLoading || !googleClientId}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 py-3 rounded-xl font-semibold text-brand-dark dark:text-slate-100 flex items-center justify-center gap-3 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <GoogleMark />
            {googleLoading ? 'Connecting...' : 'Continue with Google'}
          </button>
        </div>
        <p className="text-center mt-8 text-slate-600 font-medium">
          Already have an account?{' '}
          <Link href="/login" className="text-brand-blue font-bold hover:underline">Log in</Link>
        </p>
      </div>
    </main>
  );
}
