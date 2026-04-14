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

    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { domainId, method } = await req.json();

    if (!domainId || !method || !['dns_txt', 'html_file', 'meta_tag'].includes(method)) {
      return new Response(JSON.stringify({ error: 'Invalid input. Required: domainId, method (dns_txt|html_file|meta_tag)' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get domain
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

    if (domain.is_verified) {
      return new Response(JSON.stringify({ verified: true, message: 'Domain already verified' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let verified = false;
    let errorMsg = '';

    switch (method) {
      case 'dns_txt': {
        try {
          const txtRecords = await Deno.resolveDns(`_auradef.${domain.domain}`, 'TXT');
          const flatRecords = txtRecords.flat();
          verified = flatRecords.some(r => r.includes(`auradef-verify=${domain.verification_token}`));
          if (!verified) {
            // Also check root domain TXT records
            const rootTxt = await Deno.resolveDns(domain.domain, 'TXT');
            const rootFlat = rootTxt.flat();
            verified = rootFlat.some(r => r.includes(`auradef-verify=${domain.verification_token}`));
          }
          if (!verified) {
            errorMsg = 'TXT record not found. Make sure you added the correct record and waited for DNS propagation (can take up to 48 hours).';
          }
        } catch {
          errorMsg = 'Could not resolve DNS TXT records. Check that the record exists and DNS has propagated.';
        }
        break;
      }

      case 'html_file': {
        try {
          const url = `https://${domain.domain}/auradef-verify-${domain.verification_token.slice(0, 16)}.html`;
          const response = await fetch(url, { redirect: 'follow' });
          const body = await response.text();
          verified = body.trim().includes(domain.verification_token);
          if (!verified) {
            errorMsg = 'Verification file not found or contains wrong content.';
          }
        } catch {
          errorMsg = 'Could not fetch verification file from your website.';
        }
        break;
      }

      case 'meta_tag': {
        try {
          const response = await fetch(`https://${domain.domain}`, { redirect: 'follow' });
          const html = await response.text();
          const metaMatch = html.match(/<meta[^>]*name=["']auradef-verify["'][^>]*content=["']([^"']+)["']/i);
          verified = metaMatch?.[1] === domain.verification_token;
          if (!verified) {
            errorMsg = 'Meta tag not found or contains wrong token. Make sure it is in the <head> section.';
          }
        } catch {
          errorMsg = 'Could not fetch your homepage to check the meta tag.';
        }
        break;
      }
    }

    if (verified) {
      await supabaseAdmin
        .from('domains')
        .update({
          is_verified: true,
          verified_at: new Date().toISOString(),
          verification_method: method,
        })
        .eq('id', domainId);

      return new Response(JSON.stringify({ verified: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ verified: false, error: errorMsg }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
