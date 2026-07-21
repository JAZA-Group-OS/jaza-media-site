import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react', '@base-ui/react'],
  },

  async headers() {
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
      // CSP: tight default-src, allow Supabase + Calendly origins explicitly.
      // 'unsafe-inline' is required for Next.js + Tailwind injected styles.
      {
        key: 'Content-Security-Policy',
        value: [
          "default-src 'self'",
          "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://assets.calendly.com",
          "style-src 'self' 'unsafe-inline' https://assets.calendly.com https://fonts.googleapis.com",
          "img-src 'self' data: blob: https:",
          "font-src 'self' data: https://fonts.gstatic.com",
          "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://calendly.com https://*.calendly.com",
          "frame-src https://calendly.com https://*.calendly.com",
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
