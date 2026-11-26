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
    'group flex items-center rounded-xl bg-[#1c1c1f]/90 border border-white/10 transition-all focus-within:border-[#FFC400] focus-within:shadow-[0_0_0_1px_#FFC400,0_0_18px_rgba(255,196,0,0.18)]';
  const fieldIcon =
    'relative flex items-center pl-4 pr-4 text-white/60 group-focus-within:text-[#FFC400] transition-colors after:absolute after:right-0 after:top-1/2 after:h-5 after:w-px after:-translate-y-1/2 after:bg-white/25';
  const fieldInput =
    'flex-1 min-w-0 bg-transparent py-3 pl-3 pr-3 text-sm text-white placeholder:text-white/35 focus:outline-none';

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0f0f11] flex items-center justify-center px-4 text-white">
      {/* Glowing gold swooshes — cut from the approved design */}
      {/* eslint-disable @next/next/no-img-element */}
      <img
        src="/images/admin-swoosh-tl.png"
        alt=""
        aria-hidden
        className="pointer-events-none select-none absolute top-0 left-0 w-[min(640px,75vw)] h-auto [mask-image:linear-gradient(to_right,black_45%,transparent),linear-gradient(to_bottom,black_45%,transparent)] [mask-composite:intersect]"
      />
      <img
        src="/images/admin-swoosh-br.png"
        alt=""
        aria-hidden
        className="pointer-events-none select-none absolute bottom-0 right-0 w-[min(535px,70vw)] h-auto [mask-image:linear-gradient(to_left,black_45%,transparent),linear-gradient(to_top,black_45%,transparent)] [mask-composite:intersect]"
      />
      {/* eslint-enable @next/next/no-img-element */}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-[506px]"
      >
        <div className="relative min-h-[473px] rounded-[2rem] border-[1.5px] border-[#E8B400]/70 bg-[#0c0c0e] bg-[radial-gradient(120%_70%_at_0%_0%,rgba(255,196,0,0.14),transparent_55%),linear-gradient(180deg,#141416,#08080a)] px-6 py-7 sm:px-8 sm:py-8 shadow-[inset_0_1px_0_rgba(255,220,120,0.25),0_0_30px_rgba(255,196,0,0.10),0_30px_60px_-20px_rgba(0,0,0,0.85)]">
          {/* bottom edge glow */}
          <div className="pointer-events-none absolute -bottom-[1.5px] left-1/2 h-[2px] w-[70%] -translate-x-1/2 bg-gradient-to-r from-transparent via-[#FFC400] to-transparent" />
          <div className="pointer-events-none absolute -bottom-[2px] left-1/2 h-[3px] w-[30%] -translate-x-1/2 rounded-full bg-[#FFE27A] blur-[2px]" />
          <div className="pointer-events-none absolute -bottom-10 left-1/2 h-16 w-[60%] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(closest-side,rgba(255,180,0,0.35),transparent)]" />

          <div className="text-center mb-5">
            {/* fixed-size spacer: the logo floats above the card without shifting the form */}
            <div className="relative mx-auto mb-3 h-14 w-[140px]">
              {/* Live-text wordmark: crisp at any size, no black box */}
              <div
                role="img"
                aria-label="JAZA Media"
                className="absolute left-1/2 top-0 flex h-[112px] w-[280px] -translate-x-1/2 -translate-y-[199px] select-none flex-col items-center justify-center"
              >
                <span
                  aria-hidden
                  className="font-[family-name:var(--font-display)] text-[84px] leading-[1] px-3 pb-1 tracking-[0.04em] bg-gradient-to-b from-white via-[#f6f1e4] to-[#cfc6b0] bg-clip-text text-transparent drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)]"
                >
                  JAZA
                </span>
                <span
                  aria-hidden
                  className="mt-1 flex w-full items-center justify-center gap-3 font-[family-name:var(--font-heading)] text-[15px] font-semibold tracking-[0.5em] text-[#FFC400] drop-shadow-[0_0_10px_rgba(255,196,0,0.45)]"
                >
                  <span className="h-px w-8 bg-gradient-to-r from-transparent to-[#FFC400]/70" />
                  <span className="-mr-[0.5em]">MEDIA</span>
                  <span className="h-px w-8 bg-gradient-to-l from-transparent to-[#FFC400]/70" />
                </span>
              </div>
            </div>
            <h1 className="font-[family-name:var(--font-heading)] text-2xl sm:text-[1.7rem] font-bold leading-tight mb-2 tracking-tight -translate-y-10">
              JAZA Media <span className="text-[#FFC400]">Access</span>
            </h1>
            <div className="w-10 h-[3px] bg-[#FFC400] mx-auto rounded-full -translate-y-10" />
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

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="admin-email" className="block text-sm font-semibold mb-2">
                Email Address
              </label>
              <div className={fieldBox}>
                <span className={fieldIcon}>
                  <Mail className="w-5 h-5" />
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
              <label htmlFor="admin-password" className="block text-sm font-semibold mb-2">
                Password
              </label>
              <div className={fieldBox}>
                <span className={fieldIcon}>
                  <Lock className="w-5 h-5" />
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
                  className="pr-4 pl-2 text-white/60 hover:text-[#FFC400] transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </motion.button>
              </div>
            </div>

            <motion.button
              type="submit"
              whileHover={!isLoading ? { scale: 1.02 } : {}}
              whileTap={!isLoading ? { scale: 0.98 } : {}}
              disabled={isLoading}
              className="w-full px-6 py-3 rounded-full bg-[#FFC400] text-black text-base font-bold hover:bg-[#FFD23F] hover:shadow-[0_0_24px_rgba(255,196,0,0.35)] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3"
            >
              {isLoading ? (
                <motion.div
                  className="w-5 h-5 rounded-full border-2 border-black border-t-transparent"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Number.POSITIVE_INFINITY, ease: 'linear' }}
                />
              ) : (
                <ShieldCheck className="w-5 h-5" strokeWidth={2.25} />
              )}
              {isLoading ? 'Authenticating...' : 'Secure Login'}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
