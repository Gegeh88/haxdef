import { corsHeaders } from '../_shared/cors.ts';
import { getSupabaseAdmin, getSupabaseUser } from '../_shared/supabase-admin.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUser = getSupabaseUser(authHeader);
    const supabaseAdmin = getSupabaseAdmin();

    // Get authenticated user
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { domainId, scanType } = await req.json();

    // Validate input
    if (!domainId || !scanType || !['quick', 'full'].includes(scanType)) {
      return new Response(JSON.stringify({ error: 'Invalid input. Required: domainId, scanType (quick|full)' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check domain exists and belongs to user
    const { data: domain, error: domainError } = await supabaseUser
      .from('domains')
      .select('*')
      .eq('id', domainId)
      .single();

    if (domainError || !domain) {
      return new Response(JSON.stringify({ error: 'Domain not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check domain is verified
    if (!domain.is_verified) {
      return new Response(JSON.stringify({ error: 'Domain not verified. Please verify ownership first.' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check quota
    const { data: quota } = await supabaseAdmin
      .from('scan_quotas')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (quota) {
      const today = new Date().toISOString().split('T')[0];

      // Reset daily counters if new day
      if (quota.last_reset_date !== today) {
        await supabaseAdmin
          .from('scan_quotas')
          .update({ daily_quick_scans: 0, daily_full_scans: 0, last_reset_date: today })
          .eq('user_id', user.id);
        quota.daily_quick_scans = 0;
        quota.daily_full_scans = 0;
      }

      const currentCount = scanType === 'quick' ? quota.daily_quick_scans : quota.daily_full_scans;
      const maxCount = scanType === 'quick' ? quota.max_daily_quick : quota.max_daily_full;

      if (currentCount >= maxCount) {
        return new Response(JSON.stringify({
          error: `Daily ${scanType} scan limit reached (${maxCount}). Try again tomorrow.`,
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Check for already running scan on same domain
    const { data: runningScan } = await supabaseAdmin
      .from('scans')
      .select('id')
      .eq('domain_id', domainId)
      .in('status', ['queued', 'running'])
      .limit(1);

    if (runningScan && runningScan.length > 0) {
      return new Response(JSON.stringify({ error: 'A scan is already in progress for this domain.' }), {
        status: 409,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create the scan (worker will pick it up via polling)
    const { data: scan, error: scanError } = await supabaseAdmin
      .from('scans')
      .insert({
        domain_id: domainId,
        user_id: user.id,
        scan_type: scanType,
        status: 'queued',
      })
      .select()
      .single();

    if (scanError) {
      return new Response(JSON.stringify({ error: 'Failed to create scan' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Increment quota
    const quotaField = scanType === 'quick' ? 'daily_quick_scans' : 'daily_full_scans';
    await supabaseAdmin
      .from('scan_quotas')
      .update({ [quotaField]: (quota?.[quotaField] || 0) + 1 })
      .eq('user_id', user.id);

    return new Response(JSON.stringify({ scanId: scan.id, status: 'queued' }), {
      status: 201,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
