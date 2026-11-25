'use client';

import type React from 'react';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setIsLoading(false);
      return;
    }

    // Hard navigation (not router.push) so the just-written session cookie is
    // guaranteed to accompany the next request. A client-side push can race
    // the async cookie write and land back on /login until cookies settle.
    // `replace` keeps the login page out of history. Stays loading until the
    // browser tears down this document.
    window.location.replace('/admin/dashboard');
  };

  return (
    <div className="min-h-screen bg-adm-bg flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="p-8 rounded-xl bg-gradient-to-br from-adm-surface to-black border border-adm-line">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">
              Admin<span className="text-adm-accent-ink">Access</span>
            </h1>
            <div className="w-12 h-1 bg-adm-accent mx-auto rounded-full"></div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 mb-6"
            >
              <p className="text-red-500 text-sm">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full px-4 py-3 rounded-lg bg-adm-raised border border-adm-line-strong text-adm-text focus:border-adm-accent focus:outline-none transition-colors"
                placeholder="you@jazamedia.com"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full px-4 py-3 rounded-lg bg-adm-raised border border-adm-line-strong text-adm-text focus:border-adm-accent focus:outline-none transition-colors pr-12"
                  placeholder="••••••••"
                  disabled={isLoading}
                />
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-adm-muted hover:text-adm-accent-ink transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </motion.button>
              </div>
            </div>

            <motion.button
              type="submit"
              whileHover={!isLoading ? { scale: 1.05 } : {}}
              whileTap={!isLoading ? { scale: 0.95 } : {}}
              disabled={isLoading}
              className="w-full px-6 py-3 rounded-full bg-adm-accent text-black font-semibold hover:bg-[#FFC849] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {isLoading && (
                <motion.div
                  className="w-4 h-4 rounded-full border-2 border-black border-t-transparent"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Number.POSITIVE_INFINITY, ease: 'linear' }}
                />
              )}
              {isLoading ? 'Authenticating...' : 'Secure Login'}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
