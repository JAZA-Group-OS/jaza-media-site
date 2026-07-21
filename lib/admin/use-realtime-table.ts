'use client';

/**
 * Subscribe an admin manager to a Supabase table with real-time updates.
 *
 * Does two things in one call:
 *   1) Initial SELECT, ordered by created_at desc.
 *   2) postgres_changes subscription on INSERT and UPDATE — new rows are
 *      prepended to local state; updated rows replace by id.
 *
 * RLS still applies to the broadcast, so the subscriber only receives rows
 * they could SELECT. The lead-tables RLS scopes that to the admin email.
 *
 * The optional `filter` is forwarded to both the initial fetch (`.eq()`) and
 * the realtime subscription's `filter` so each manager only sees the slice
 * it cares about (e.g. course_slug=marketing).
 *
 * The hook intentionally does NOT subscribe to DELETE — none of these tables
 * are deleted from in-app, and broadcasting deletes would just mask bugs if
 * a row disappeared unexpectedly.
 */

import { useEffect, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { supabase } from '@/lib/supabase/client';

interface RowWithId {
  id: string;
}

type FetchResult<T> = {
  data: T[] | null;
  error: { message: string } | null;
};

type FetchBuilder<T> = {
  order: (col: string, opts: { ascending: boolean }) => Promise<FetchResult<T>>;
  eq?: (col: string, val: string) => FetchBuilder<T>;
};

type FromBuilder<T> = {
  select: (cols: string) => FetchBuilder<T> & {
    eq: (col: string, val: string) => FetchBuilder<T>;
  };
};

export type RealtimeFilter = {
  column: string;
  value: string;
};

export interface UseRealtimeTableResult<T> {
  rows: T[];
  loading: boolean;
  error: string | null;
  setRows: Dispatch<SetStateAction<T[]>>;
}

export function useRealtimeTable<T extends RowWithId>(
  table: string,
  options?: { filter?: RealtimeFilter },
): UseRealtimeTableResult<T> {
  const [rows, setRows] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filterCol = options?.filter?.column;
  const filterVal = options?.filter?.value;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const from = supabase.from(table) as unknown as FromBuilder<T>;
    const select = from.select('*');
    const builder: FetchBuilder<T> =
      filterCol && filterVal ? select.eq(filterCol, filterVal) : select;

    builder
      .order('created_at', { ascending: false })
      .then(({ data, error: fetchError }) => {
        if (cancelled) return;
        if (fetchError) {
          setError(fetchError.message);
          setLoading(false);
          return;
        }
        setRows(data ?? []);
        setLoading(false);
      });

    const channelName = `realtime:${table}${
      filterCol && filterVal ? `:${filterCol}=${filterVal}` : ''
    }`;
    const realtimeFilter =
      filterCol && filterVal ? `${filterCol}=eq.${filterVal}` : undefined;

    const channel = supabase
      .channel(channelName)
      .on(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        'postgres_changes' as any,
        {
          event: 'INSERT',
          schema: 'public',
          table,
          ...(realtimeFilter ? { filter: realtimeFilter } : {}),
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (payload: any) => {
          const row = payload.new as T;
          setRows((prev) => {
            // Defensive: dedupe by id in case the initial fetch raced with
            // the subscription and we already have the row.
            if (prev.some((r) => r.id === row.id)) return prev;
            return [row, ...prev];
          });
        },
      )
      .on(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        'postgres_changes' as any,
        {
          event: 'UPDATE',
          schema: 'public',
          table,
          ...(realtimeFilter ? { filter: realtimeFilter } : {}),
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (payload: any) => {
          const row = payload.new as T;
          setRows((prev) => prev.map((r) => (r.id === row.id ? row : r)));
        },
      )
      .subscribe();

    return () => {
      cancelled = true;
      void supabase.removeChannel(channel);
    };
  }, [table, filterCol, filterVal]);

  return { rows, loading, error, setRows };
}
