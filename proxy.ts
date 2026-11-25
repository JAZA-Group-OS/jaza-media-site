import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { ADMIN_EMAIL } from '@/lib/admin/config';

/**
 * Combined proxy (formerly middleware.ts — renamed per Next.js 16) for:
 *   1. Supabase session refresh (cookies stay current across requests)
 *   2. Subdomain routing — admin.<host> serves /admin/*
 *   3. Server-side auth gate — unauthenticated requests to admin pages are
 *      redirected to /login BEFORE any HTML is sent
 *
 * Defense-in-depth: the admin dashboard also re-verifies the session in a
 * Server Component, and AdminSessionProvider runs client-side as a backup.
 *
 * The `proxy` runtime is always nodejs (the edge runtime is not supported),
 * which suits the Supabase cookie handling here.
 */

/**
 * Carry any refreshed Supabase auth cookies from the base response onto a
 * redirect/rewrite response. Without this, a token rotation performed by
 * getUser() below is silently dropped on those branches, intermittently
 * logging the admin out. This is the documented @supabase/ssr pitfall.
 */
function copyAuthCookies(from: NextResponse, to: NextResponse): void {
  for (const cookie of from.cookies.getAll()) {
    to.cookies.set(cookie);
  }
}

export async function proxy(request: NextRequest) {
  const host = request.headers.get('host') ?? '';
  const hostname = host.split(':')[0];
  const port = host.includes(':') ? `:${host.split(':')[1]}` : '';
  const isAdminSubdomain = hostname.startsWith('admin.');
  // *.vercel.app can't serve a nested admin. subdomain, so on those hosts the
  // admin lives at /admin/* on the main host instead ("path mode").
  const pathMode = hostname.endsWith('.vercel.app');
  const url = request.nextUrl.clone();

  // Step 1: Force /admin/* on the main host onto the subdomain. This runs
  // before any session work, so there are no refreshed cookies to preserve.
  if (!pathMode && !isAdminSubdomain && url.pathname.startsWith('/admin')) {
    const newPath = url.pathname.replace(/^\/admin/, '') || '/dashboard';
    const adminHost = `admin.${hostname}${port}`;
    return NextResponse.redirect(
      new URL(`${newPath}${url.search}`, `${url.protocol}//${adminHost}`),
    );
  }

  // Step 2: Build the response object that will carry refreshed cookies.
  let response = NextResponse.next({ request });

  // Step 3: Run Supabase session refresh on every request via the cookie API.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Trigger token refresh + populate user state from cookies.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAdmin = user?.email === ADMIN_EMAIL;

  // Step 4: On the admin subdomain, gate non-login traffic on a real session
  // AND on the admin email — RLS protects data, but the dashboard bundle is
  // sensitive enough to deny non-admin authenticated users at the edge.
  if (pathMode && url.pathname.startsWith('/admin')) {
    if (!isAdmin && url.pathname !== '/admin/login') {
      const loginUrl = url.clone();
      loginUrl.pathname = '/admin/login';
      const redirect = NextResponse.redirect(loginUrl);
      copyAuthCookies(response, redirect);
      return redirect;
    }
    if (url.pathname === '/admin' || url.pathname === '/admin/') {
      const dash = url.clone();
      dash.pathname = '/admin/dashboard';
      const redirect = NextResponse.redirect(dash);
      copyAuthCookies(response, redirect);
      return redirect;
    }
  }

  if (isAdminSubdomain) {
    const isLoginPath =
      url.pathname === '/login' || url.pathname === '/admin/login';

    if (!isAdmin && !isLoginPath) {
      const loginUrl = url.clone();
      loginUrl.pathname = '/admin/login';
      const redirect = NextResponse.redirect(loginUrl);
      // Preserve refreshed cookies so the login page sees current session
      // state instead of a stale/rotated token.
      copyAuthCookies(response, redirect);
      return redirect;
    }

    // Rewrite shallow paths (e.g. /dashboard) to /admin/dashboard internally.
    if (!url.pathname.startsWith('/admin')) {
      url.pathname =
        url.pathname === '/' ? '/admin/dashboard' : `/admin${url.pathname}`;
      const rewrite = NextResponse.rewrite(url, { request });
      copyAuthCookies(response, rewrite);
      return rewrite;
    }
  }

  return response;
}

export const config = {
  matcher: [
    // Skip Next.js internals, API routes, and static asset files.
    '/((?!_next|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
