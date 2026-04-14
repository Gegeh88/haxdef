import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Scan } from '../types/database';

export function useScanProgress(scanId: string | null) {
  const [scan, setScan] = useState<Scan | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch initial scan data
  const fetchScan = useCallback(async () => {
    if (!scanId) {
      setScan(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('scans')
      .select('*')
      .eq('id', scanId)
      .single();

    if (error) {
      console.error('Error fetching scan:', error);
    } else {
      setScan(data);
    }
    setLoading(false);
  }, [scanId]);

  useEffect(() => {
    fetchScan();
  }, [fetchScan]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!scanId) return;

    const channel = supabase
      .channel(`scan-${scanId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'scans',
          filter: `id=eq.${scanId}`,
        },
        (payload) => {
          setScan(payload.new as Scan);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [scanId]);

  return { scan, loading, refetch: fetchScan };
}
