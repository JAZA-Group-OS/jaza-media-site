import 'server-only';

import { ADMIN_EMAIL } from '@/lib/admin/config';
import { createServerClient } from '@/lib/supabase/server';

export async function isAdminRequest(): Promise<boolean> {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.email === ADMIN_EMAIL;
}
