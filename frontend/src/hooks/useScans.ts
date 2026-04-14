import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Scan } from '../types/database';

interface ScanWithDomain extends Scan {
  domains: { domain: string };
}

export function useScans() {
  const [scans, setScans] = useState<ScanWithDomain[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchScans = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('scans')
      .select('*, domains(domain)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching scans:', error);
    } else {
      setScans((data as ScanWithDomain[]) || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchScans();
  }, [fetchScans]);

  return { scans, loading, refetch: fetchScans };
}
