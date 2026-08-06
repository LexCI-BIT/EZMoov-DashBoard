import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import { fetchAdminData } from '../lib/adminQueries';
import type { AdminData } from '../lib/types';

interface UseAdminDataResult {
  data: AdminData | null;
  loading: boolean;
  error: string | null;
  refreshing: boolean;
  lastUpdated: Date | null;
  refresh: () => void;
}

/**
 * Loads every dashboard dataset in one pass and keeps it fresh.
 *
 * Realtime is already enabled on public.drivers and public.bookings, so we
 * subscribe to both and refetch on change — that's what makes the "Live"
 * badges on the stat cards actually mean something.
 */
export function useAdminData(): UseAdminDataResult {
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const mounted = useRef(true);
  const inFlight = useRef(false);

  const load = useCallback(async (isInitial: boolean) => {
    if (inFlight.current) return;
    inFlight.current = true;

    if (isInitial) setLoading(true);
    else setRefreshing(true);

    try {
      const next = await fetchAdminData();
      if (!mounted.current) return;
      setData(next);
      setError(null);
      setLastUpdated(new Date());
    } catch (err) {
      if (!mounted.current) return;
      setError(err instanceof Error ? err.message : 'Something went wrong loading dashboard data.');
    } finally {
      inFlight.current = false;
      if (mounted.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    void load(true);

    // Debounce bursts of realtime events into a single refetch.
    let timer: ReturnType<typeof setTimeout> | undefined;
    const scheduleRefresh = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => void load(false), 600);
    };

    const channel = supabase
      .channel('admin-dashboard')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, scheduleRefresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'drivers' }, scheduleRefresh)
      .subscribe();

    return () => {
      mounted.current = false;
      if (timer) clearTimeout(timer);
      void supabase.removeChannel(channel);
    };
  }, [load]);

  const refresh = useCallback(() => {
    void load(false);
  }, [load]);

  return { data, loading, error, refreshing, lastUpdated, refresh };
}
