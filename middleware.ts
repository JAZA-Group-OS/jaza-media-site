import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Combined middleware for:
 *   1. Supabase session refresh (cookies stay current across requests)
 *   2. Subdomain routing — admin.<host> serves /admin/*
 *   3. Server-side auth gate — unauthenticated requests to admin pages are
 *      redirected to /login BEFORE any HTML is sent
 *
 * Defense-in-depth: AdminSessionProvider still runs client-side as a backup.
 */
export async function middleware(request: NextRequest) {
  const host = request.headers.get('host') ?? '';
  const hostname = host.split(':')[0];
  const port = host.includes(':') ? `:${host.split(':')[1]}` : '';
  const isAdminSubdomain = hostname.startsWith('admin.');
  const url = request.nextUrl.clone();

  // Step 1: Force /admin/* on the main host onto the subdomain.
  if (!isAdminSubdomain && url.pathname.startsWith('/admin')) {
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

  // Step 4: On the admin subdomain, gate non-login traffic on a real session.
  if (isAdminSubdomain) {
    const isLoginPath = url.pathname === '/login' || url.pathname === '/admin/login';

    if (!user && !isLoginPath) {
      const loginUrl = url.clone();
      loginUrl.pathname = '/admin/login';
      return NextResponse.redirect(loginUrl);
    }

    // Rewrite shallow paths (e.g. /dashboard) to /admin/dashboard internally.
    if (!url.pathname.startsWith('/admin')) {
      url.pathname =
        url.pathname === '/' ? '/admin/dashboard' : `/admin${url.pathname}`;
      return NextResponse.rewrite(url, { request });
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
