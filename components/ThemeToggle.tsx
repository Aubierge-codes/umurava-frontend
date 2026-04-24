"use client";

import { useSyncExternalStore } from 'react';
import { MoonStar, SunMedium } from 'lucide-react';

const STORAGE_KEY = 'gwiza_theme';

export default function ThemeToggle() {
  const theme = useSyncExternalStore(
    (onStoreChange) => {
      if (typeof window === 'undefined') return () => {};
      const handleThemeChange = () => onStoreChange();
      window.addEventListener('storage', handleThemeChange);
      window.addEventListener('gwiza-theme-change', handleThemeChange as EventListener);
      return () => {
        window.removeEventListener('storage', handleThemeChange);
        window.removeEventListener('gwiza-theme-change', handleThemeChange as EventListener);
      };
    },
    () => {
      if (typeof document === 'undefined') return 'light';
      return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    },
    () => 'light'
  );

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.classList.toggle('dark', nextTheme === 'dark');
    window.localStorage.setItem(STORAGE_KEY, nextTheme);
    window.dispatchEvent(new Event('gwiza-theme-change'));
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-2 text-xs font-bold text-brand-dark backdrop-blur transition-colors hover:bg-white dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-100 dark:hover:bg-slate-800"
    >
      {theme === 'dark' ? <SunMedium size={16} /> : <MoonStar size={16} />}
      {theme === 'dark' ? 'Light' : 'Dark'}
    </button>
  );
}
