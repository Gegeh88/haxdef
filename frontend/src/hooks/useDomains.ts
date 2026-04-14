import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Domain } from '../types/database';

export function useDomains() {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDomains = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('domains')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    setDomains(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchDomains();
  }, [fetchDomains]);

  const addDomain = async (domainName: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const cleanDomain = domainName.toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '').trim();

    const { data, error } = await supabase
      .from('domains')
      .insert({ domain: cleanDomain, user_id: user.id })
      .select()
      .single();

    if (error) throw error;
    setDomains(prev => [data, ...prev]);
    return data;
  };

  const removeDomain = async (domainId: string) => {
    const { error } = await supabase
      .from('domains')
      .delete()
      .eq('id', domainId);

    if (error) throw error;
    setDomains(prev => prev.filter(d => d.id !== domainId));
  };

  const verifyDomain = async (domainId: string, method: 'dns_txt' | 'html_file' | 'meta_tag') => {
    const { data, error } = await supabase
      .from('domains')
      .update({ verification_method: method })
      .eq('id', domainId)
      .select()
      .single();

    if (error) throw error;

    const idx = domains.findIndex(d => d.id === domainId);
    if (idx >= 0) {
      const updated = [...domains];
      updated[idx] = data;
      setDomains(updated);
    }
    return data;
  };

  return { domains, loading, addDomain, removeDomain, verifyDomain, refetch: fetchDomains };
}
