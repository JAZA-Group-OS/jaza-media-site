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

import { useCallback, useEffect, useId, useState } from 'react';
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
  const filterCol = options?.filter?.column;
  const filterVal = options?.filter?.value;

  // Unique per hook instance. Without it, two mounted components subscribing
  // the same table+filter (e.g. DashboardOverview and a manager tab both on
  // partner_inquiries) would build identical channel names, and supabase-js
  // dedupes same-named channels — dropping one subscriber's updates.
  const instanceId = useId();

  // Identity of the current query. `loading` is DERIVED from whether the
  // loaded slice matches this key, so the effect never has to call setState
  // synchronously in its body (which triggers a cascading render and the
  // react-hooks/set-state-in-effect lint error). setState happens only in the
  // async fetch resolution and realtime callbacks, which is allowed.
  const queryKey = `${table}|${filterCol ?? ''}|${filterVal ?? ''}`;

  const [state, setState] = useState<{
    key: string | null;
    rows: T[];
    error: string | null;
  }>({ key: null, rows: [], error: null });

  const loading = state.key !== queryKey;
  // Suppress stale rows/errors from a previous query while the new one loads.
  const rows = state.key === queryKey ? state.rows : [];
  const error = state.key === queryKey ? state.error : null;

  // Stable setter for consumers that mutate rows after an admin action.
  const setRows = useCallback<Dispatch<SetStateAction<T[]>>>((action) => {
    setState((s) => ({
      ...s,
      rows:
        typeof action === 'function'
          ? (action as (prev: T[]) => T[])(s.rows)
          : action,
    }));
  }, []);

  useEffect(() => {
    let cancelled = false;

    const from = supabase.from(table) as unknown as FromBuilder<T>;
    const select = from.select('*');
    const builder: FetchBuilder<T> =
      filterCol && filterVal ? select.eq(filterCol, filterVal) : select;

    builder
      .order('created_at', { ascending: false })
      .then(({ data, error: fetchError }) => {
        if (cancelled) return;
        setState({
          key: queryKey,
          rows: fetchError ? [] : data ?? [],
          error: fetchError ? fetchError.message : null,
        });
      });

    const channelName = `realtime:${table}${
      filterCol && filterVal ? `:${filterCol}=${filterVal}` : ''
    }:${instanceId}`;
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
          setState((s) => {
            // Defensive: dedupe by id in case the initial fetch raced with
            // the subscription and we already have the row.
            if (s.rows.some((r) => r.id === row.id)) return s;
            return { ...s, rows: [row, ...s.rows] };
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
          setState((s) => ({
            ...s,
            rows: s.rows.map((r) => (r.id === row.id ? row : r)),
          }));
        },
      )
      .subscribe();

    return () => {
      cancelled = true;
      void supabase.removeChannel(channel);
    };
  }, [table, filterCol, filterVal, queryKey, instanceId]);

  return { rows, loading, error, setRows };
}
