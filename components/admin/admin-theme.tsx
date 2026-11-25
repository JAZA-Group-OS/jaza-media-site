'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';

type Theme = 'dark' | 'light';
const KEY = 'jaza-admin-theme';

const Ctx = createContext<{ theme: Theme; toggle: () => void }>({ theme: 'dark', toggle: () => {} });

export const useAdminTheme = () => useContext(Ctx);

/** Scopes the admin palette (.admin-ui in globals.css) and remembers light/dark per browser. */
export function AdminTheme({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark');
  const ready = useRef(false);

  // Read the saved choice once, then save every change after that.
  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem(KEY);
    } catch {
      /* storage blocked — stay dark */
    }
    queueMicrotask(() => {
      if (saved === 'light') setTheme('light');
      ready.current = true;
    });
  }, []);

  useEffect(() => {
    if (!ready.current) return;
    try {
      localStorage.setItem(KEY, theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  const toggle = useCallback(() => setTheme((t) => (t === 'dark' ? 'light' : 'dark')), []);

  return (
    <Ctx.Provider value={{ theme, toggle }}>
      <div
        data-theme={theme}
        className={`admin-ui ${theme === 'dark' ? 'dark' : ''} min-h-screen bg-adm-bg font-sans text-adm-text antialiased`}
      >
        {children}
      </div>
    </Ctx.Provider>
  );
}
