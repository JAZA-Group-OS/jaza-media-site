import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react', '@base-ui/react'],
  },

  async headers() {
    // 'unsafe-eval' is only needed by the dev bundler (eval source maps).
    // Production build output doesn't use eval, so we drop it there to
    // tighten XSS protection. Verify interactive pages in a preview browser
    // after changing this.
    const isDev = process.env.NODE_ENV !== 'production';
    const scriptSrc = [
      "script-src 'self' 'unsafe-inline'",
      isDev ? "'unsafe-eval'" : '',
    ]
      .filter(Boolean)
      .join(' ');

    const securityHeaders = [
      // Click-jacking: deny framing entirely.
      { key: 'X-Frame-Options', value: 'DENY' },
      // MIME-sniffing: stop browsers from second-guessing Content-Type.
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      // Referrer leakage: send only origin on cross-site nav.
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      // Disable powerful APIs we don't use.
      {
        key: 'Permissions-Policy',
        value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
      },
      // HSTS: enforce HTTPS once Vercel serves over TLS in prod.
      {
        key: 'Strict-Transport-Security',
        value: 'max-age=63072000; includeSubDomains; preload',
      },
      // CSP: tight default-src, allow Supabase origins explicitly.
      // 'unsafe-inline' is required for Next.js + Tailwind injected styles.
      {
        key: 'Content-Security-Policy',
        value: [
          "default-src 'self'",
          scriptSrc,
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
          "img-src 'self' data: blob: https:",
          "font-src 'self' data: https://fonts.gstatic.com",
          // 127.0.0.1:47822 = the admin AI Agent's Claude bridge on the owner's own computer.
          "connect-src 'self' https://*.supabase.co wss://*.supabase.co http://127.0.0.1:47822",
          "frame-src 'none'",
          "frame-ancestors 'none'",
          "base-uri 'self'",
          "form-action 'self'",
        ].join('; '),
      },
    ];

    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
