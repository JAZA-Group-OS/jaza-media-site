import 'server-only';

import { db } from './core';
import { TIER_CALENDAR, type Tier } from './lead-score';

export type Lead = { id: string; tier: Tier; booking_id: string | null };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** The calendar a Book a Call lead may book, or null (unknown lead / auto-nurture). */
export async function calendarForLead(leadId: string | null | undefined): Promise<{ lead: Lead; calendarId: 1 | 2 } | null> {
  if (!leadId || !UUID.test(leadId)) return null;
  const { data } = await db().from('booking_leads').select('id,tier,booking_id').eq('id', leadId).maybeSingle();
  const lead = data as Lead | null;
  if (!lead || lead.tier === 'nurture') return null;
  return { lead, calendarId: TIER_CALENDAR[lead.tier] };
}
