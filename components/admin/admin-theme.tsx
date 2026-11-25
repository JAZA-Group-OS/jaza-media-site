'use client';

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

type Theme = 'dark' | 'light';
const KEY = 'jaza-admin-theme';

const Ctx = createContext<{ theme: Theme; toggle: () => void }>({ theme: 'dark', toggle: () => {} });

export const useAdminTheme = () => useContext(Ctx);

/** Scopes the admin palette (.admin-ui in globals.css) and remembers light/dark per browser. */
export function AdminTheme({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem(KEY);
    } catch {
      /* storage blocked — stay dark */
    }
    if (saved === 'light') queueMicrotask(() => setTheme('light'));
  }, []);

  const toggle = useCallback(() => {
    setTheme((t) => {
      const next = t === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem(KEY, next);
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

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
