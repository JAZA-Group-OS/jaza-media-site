'use client';

import type React from 'react';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, ShieldCheck } from 'lucide-react';
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

  const fieldBox =
    'group flex items-center rounded-2xl bg-[#1c1c1f]/90 border border-white/10 transition-all focus-within:border-[#FFC400] focus-within:shadow-[0_0_0_1px_#FFC400,0_0_18px_rgba(255,196,0,0.18)]';
  const fieldIcon =
    'flex items-center pl-5 pr-4 text-white/60 group-focus-within:text-[#FFC400] transition-colors';
  const fieldInput =
    'flex-1 min-w-0 bg-transparent py-4 pl-4 pr-4 border-l border-white/20 text-white placeholder:text-white/35 focus:outline-none';

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0b0b0c] flex items-center justify-center px-4 text-white">
      {/* Glowing gold swooshes */}
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 1700 920"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="swoosh-gold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#FFC400" />
            <stop offset="1" stopColor="#FF9F00" />
          </linearGradient>
          <linearGradient id="swoosh-grey" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#3a3a3d" stopOpacity="0.7" />
            <stop offset="1" stopColor="#1a1a1c" stopOpacity="0" />
          </linearGradient>
          <filter id="swoosh-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="10" />
          </filter>
        </defs>
        <path d="M0 230 C 180 90, 330 130, 620 0 L 0 0 Z" fill="url(#swoosh-grey)" />
        <path d="M0 200 C 120 90, 200 30, 300 0" stroke="url(#swoosh-gold)" strokeWidth="14" fill="none" filter="url(#swoosh-glow)" />
        <path d="M0 200 C 120 90, 200 30, 300 0" stroke="#FFD23F" strokeWidth="3" fill="none" />
        <path d="M1700 640 C 1560 820, 1250 760, 960 920 L 1700 920 Z" fill="url(#swoosh-grey)" />
        <path d="M1700 680 C 1600 800, 1500 860, 1380 920" stroke="url(#swoosh-gold)" strokeWidth="14" fill="none" filter="url(#swoosh-glow)" />
        <path d="M1700 680 C 1600 800, 1500 860, 1380 920" stroke="#FFD23F" strokeWidth="3" fill="none" />
      </svg>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-[600px]"
      >
        <div className="relative rounded-[2.5rem] border border-[#FFC400]/40 bg-gradient-to-br from-[#1d1b16]/95 via-[#0e0e10]/95 to-[#08080a]/95 px-6 py-8 sm:px-12 sm:py-10 shadow-[0_0_40px_rgba(255,196,0,0.08),0_30px_60px_-20px_rgba(0,0,0,0.8)] backdrop-blur">
          {/* bottom edge glow */}
          <div className="pointer-events-none absolute -bottom-px left-1/2 h-px w-1/2 -translate-x-1/2 bg-gradient-to-r from-transparent via-[#FFC400] to-transparent" />
          <div className="pointer-events-none absolute -bottom-6 left-1/2 h-10 w-1/3 -translate-x-1/2 rounded-full bg-[#FFC400]/25 blur-2xl" />

          <div className="text-center mb-10">
            <Lock className="mx-auto mb-3 h-10 w-10 text-[#FFC400] fill-[#FFC400]/20" strokeWidth={2.5} />
            <h1 className="text-4xl sm:text-5xl font-bold mb-4 tracking-tight">
              Admin<span className="text-[#FFC400]">Access</span>
            </h1>
            <div className="w-20 h-1.5 bg-[#FFC400] mx-auto rounded-full" />
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 mb-6"
            >
              <p className="text-red-400 text-sm">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-7">
            <div>
              <label htmlFor="admin-email" className="block text-base font-semibold mb-3">
                Email Address
              </label>
              <div className={fieldBox}>
                <span className={fieldIcon}>
                  <Mail className="w-6 h-6" />
                </span>
                <input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className={fieldInput}
                  placeholder="you@jazamedia.com"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="admin-password" className="block text-base font-semibold mb-3">
                Password
              </label>
              <div className={fieldBox}>
                <span className={fieldIcon}>
                  <Lock className="w-6 h-6" />
                </span>
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className={fieldInput}
                  placeholder="••••••••"
                  disabled={isLoading}
                />
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="pr-5 pl-2 text-white/60 hover:text-[#FFC400] transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
                </motion.button>
              </div>
            </div>

            <motion.button
              type="submit"
              whileHover={!isLoading ? { scale: 1.02 } : {}}
              whileTap={!isLoading ? { scale: 0.98 } : {}}
              disabled={isLoading}
              className="w-full px-6 py-4 rounded-full bg-[#FFC400] text-black text-lg font-bold hover:bg-[#FFD23F] hover:shadow-[0_0_24px_rgba(255,196,0,0.35)] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3"
            >
              {isLoading ? (
                <motion.div
                  className="w-5 h-5 rounded-full border-2 border-black border-t-transparent"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Number.POSITIVE_INFINITY, ease: 'linear' }}
                />
              ) : (
                <ShieldCheck className="w-6 h-6" strokeWidth={2.25} />
              )}
              {isLoading ? 'Authenticating...' : 'Secure Login'}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
