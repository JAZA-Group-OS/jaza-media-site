import { NextResponse } from 'next/server';

import { isAdminRequest } from '@/lib/booking/admin-auth';
import { db } from '@/lib/booking/core';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const back = (status: string) => {
    const res = NextResponse.redirect(new URL(`/admin/dashboard?booking_google=${status}`, url.origin));
    res.cookies.delete('booking_google_state');
    res.cookies.delete('booking_google_cal');
    return res;
  };
  if (!(await isAdminRequest())) return back('unauthorized');

  const cookieState = request.headers
    .get('cookie')
    ?.split(/;\s*/)
    .find((c) => c.startsWith('booking_google_state='))
    ?.split('=')[1];
  const calCookie = request.headers
    .get('cookie')
    ?.split(/;\s*/)
    .find((c) => c.startsWith('booking_google_cal='))
    ?.split('=')[1];
  const code = url.searchParams.get('code');
  if (!code || !cookieState || cookieState !== url.searchParams.get('state')) return back('error');

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID ?? '',
      client_secret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      redirect_uri: `${url.origin}/api/booking/google/callback`,
      grant_type: 'authorization_code',
    }),
  });
  if (!tokenRes.ok) {
    console.error('[booking/google] code exchange failed', tokenRes.status);
    return back('error');
  }
  const tokens = (await tokenRes.json()) as { refresh_token?: string; id_token?: string };
  if (!tokens.refresh_token) return back('no_refresh_token');

  let email: string | null = null;
  try {
    const payload = JSON.parse(Buffer.from(tokens.id_token!.split('.')[1], 'base64url').toString());
    email = payload.email ?? null;
  } catch {
    // email is display-only
  }
  await db()
    .from('booking_settings')
    .update({ google_refresh_token: tokens.refresh_token, google_account_email: email, updated_at: new Date().toISOString() })
    .eq('id', calCookie === '2' ? 2 : 1);
  return back('connected');
}
