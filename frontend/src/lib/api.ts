import { supabase } from './supabase';

const FUNCTIONS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;

async function callFunction(name: string, body: Record<string, unknown>) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const response = await fetch(`${FUNCTIONS_URL}/${name}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
      'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || `Function ${name} failed`);
  }
  return data;
}

export async function startScan(domainId: string, scanType: 'quick' | 'full') {
  return callFunction('start-scan', { domainId, scanType });
}

export async function verifyDomain(domainId: string, method: 'dns_txt' | 'html_file' | 'meta_tag') {
  return callFunction('verify-domain', { domainId, method });
}
