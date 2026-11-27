import { NextResponse } from 'next/server';

import { isAdminRequest } from '@/lib/booking/admin-auth';
import { newToken } from '@/lib/booking/core';

export const runtime = 'nodejs';

const SCOPES = [
  'openid',
  'email',
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/calendar.freebusy',
];

// Admin-only: start Google OAuth so the host's calendar can be read (busy
// times) and written (events + Meet links). The redirect URI is this host's
// /api/booking/google/callback — register it in Google Cloud.
export async function GET(request: Request) {
  if (!(await isAdminRequest())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) return NextResponse.json({ error: 'GOOGLE_CLIENT_ID is not set' }, { status: 500 });

  const origin = new URL(request.url).origin;
  const state = newToken();
  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  url.search = new URLSearchParams({
    client_id: clientId,
    redirect_uri: `${origin}/api/booking/google/callback`,
    response_type: 'code',
    scope: SCOPES.join(' '),
    access_type: 'offline',
    prompt: 'consent',
    include_granted_scopes: 'true',
    state,
  }).toString();

  const res = NextResponse.redirect(url);
  const cal = new URL(request.url).searchParams.get('cal') === '2' ? '2' : '1';
  res.cookies.set('booking_google_cal', cal, { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 600, path: '/' });
  res.cookies.set('booking_google_state', state, { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 600, path: '/' });
  return res;
}
