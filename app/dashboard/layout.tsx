"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Briefcase,
  Search,
  Sparkles,
  Users,
  UserCircle,
  Settings,
  Menu,
  X,
  LogOut,
} from 'lucide-react';
import { clearSession, getUser } from '@/lib/api';
import { getRoleLabel } from '@/lib/auth';
import GwizaLogo from '@/components/GwizaLogo';
import GwizaBrandMark from '@/components/GwizaBrandMark';
import ThemeToggle from '@/components/ThemeToggle';

type NavItem = {
  name: string;
  icon: React.ReactNode;
  href: string;
  roles: Array<'admin' | 'recruiter' | 'applicant'>;
};

const navItems: NavItem[] = [
  { name: 'Dashboard', icon: <LayoutDashboard size={20} />, href: '/dashboard', roles: ['admin', 'recruiter', 'applicant'] },
  { name: 'Jobs', icon: <Briefcase size={20} />, href: '/dashboard/jobs', roles: ['admin', 'recruiter', 'applicant'] },
  { name: 'Screening', icon: <Search size={20} />, href: '/dashboard/screening', roles: ['admin'] },
  { name: 'AI Results', icon: <Sparkles size={20} />, href: '/dashboard/results', roles: ['admin'] },
  { name: 'Candidates', icon: <Users size={20} />, href: '/dashboard/candidates', roles: ['admin'] },
  { name: 'Admin Requests', icon: <Users size={20} />, href: '/dashboard/admin-requests', roles: ['admin'] },
  { name: 'Account', icon: <UserCircle size={20} />, href: '/dashboard/account', roles: ['admin', 'recruiter', 'applicant'] },
  { name: 'Settings', icon: <Settings size={20} />, href: '/dashboard/settings', roles: ['admin', 'recruiter', 'applicant'] },
];

function DashboardContent({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<ReturnType<typeof getUser> | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const router = useRouter();
  const role = user?.role === 'admin' ? 'admin' : 'applicant';

  const userName = user?.name || 'User';
  const userInitials = userName.charAt(0).toUpperCase();

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('gwiza_token') : null;
    const storedUser = getUser();

    if (!token || !storedUser) {
      router.replace('/login');
      return;
    }

    const timer = window.setTimeout(() => {
      setUser(storedUser);
      setIsCheckingAuth(false);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [router]);

  const handleLogout = () => {
    clearSession();
    router.push('/login');
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#e9f2f5] flex items-center justify-center text-slate-500 font-medium">
        Checking access...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#e9f2f5] flex">
      <aside className="hidden lg:flex flex-col w-72 bg-[#2E5A88] text-white fixed h-full z-50">
        <div className="p-8 flex items-center gap-3">
          <GwizaBrandMark size={32} textClassName="text-brand-blue" />
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2">
          {navItems
            .filter((item) => item.roles.includes(role))
            .map((item) => (
            <Link key={item.name} href={item.href}
              className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-white/10 transition-all text-slate-300 hover:text-white font-medium group">
              <span className="group-hover:text-brand-blue transition-colors">{item.icon}</span>
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10 space-y-2">
          <div className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl">
            <div className="w-10 h-10 bg-brand-blue rounded-xl flex items-center justify-center font-bold text-sm shrink-0" suppressHydrationWarning>
              {userInitials}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold truncate" suppressHydrationWarning>{userName}</p>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                {getRoleLabel(user?.role)}
              </p>
            </div>
          </div>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-all font-medium text-sm">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 lg:ml-72 flex flex-col">
        <header className="h-20 bg-white border-b border-slate-100 px-4 md:px-8 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 text-brand-dark">
              <Menu size={24} color="#0ea5e9" />
            </button>
            <div className="flex items-center gap-2">
              <GwizaLogo size={28} className="lg:hidden" />
              <span className="text-lg md:text-xl font-bold text-brand-blue tracking-tight translate-y-[2px]">Gwiza</span>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <ThemeToggle />
          <div className="flex items-center gap-2 lg:hidden">
              <div className="w-9 h-9 bg-brand-blue rounded-lg flex items-center justify-center font-bold text-white text-xs" suppressHydrationWarning>
                {userInitials}
              </div>
              <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                <LogOut size={20} />
              </button>
            </div>
            {role === 'admin' ? (
              <Link href="/dashboard/jobs"
                className="hidden lg:block bg-brand-blue text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-blue-500/20 transition-all">
                + New Job
              </Link>
            ) : (
              <Link href="/dashboard/jobs"
                className="hidden lg:block bg-brand-blue text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-blue-500/20 transition-all">
                Browse Jobs
              </Link>
            )}
          </div>
        </header>

        <main className="p-4 md:p-8 flex-1 pb-24 lg:pb-8">
          {children}
        </main>
      </div>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-[#2E5A88]/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          <nav className="absolute top-0 left-0 bottom-0 w-[280px] bg-[#2E5A88] p-6 flex flex-col">
            <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-2">
                <GwizaBrandMark size={28} textClassName="text-xl text-brand-blue" />
              </div>
              <button onClick={() => setIsMobileMenuOpen(false)} className="text-white"><X size={24} /></button>
            </div>
            <div className="space-y-1 flex-1">
              {navItems.filter((item) => item.roles.includes(role)).map((item) => (
                <Link key={item.name} href={item.href} onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-4 px-4 py-4 rounded-xl text-slate-300 font-medium active:bg-white/10">
                  {item.icon} {item.name}
                </Link>
              ))}
              <button onClick={handleLogout}
                className="w-full flex items-center gap-4 px-4 py-4 rounded-xl text-red-400 font-medium active:bg-white/10 mt-auto">
                <LogOut size={20} /> Logout
              </button>
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading...</div>}>
      <DashboardContent>{children}</DashboardContent>
    </Suspense>
  );
}
