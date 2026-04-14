import { corsHeaders } from '../_shared/cors.ts';
import { getSupabaseAdmin } from '../_shared/supabase-admin.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Authenticate via worker secret
    const workerSecret = req.headers.get('X-Worker-Secret');
    const expectedSecret = Deno.env.get('WORKER_WEBHOOK_SECRET');
    if (!workerSecret || workerSecret !== expectedSecret) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { scanId } = await req.json();
    if (!scanId) {
      return new Response(JSON.stringify({ error: 'Missing scanId' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseAdmin = getSupabaseAdmin();

    // Get scan with domain info
    const { data: scan, error: scanError } = await supabaseAdmin
      .from('scans')
      .select('*, domains(domain)')
      .eq('id', scanId)
      .single();

    if (scanError || !scan) {
      return new Response(JSON.stringify({ error: 'Scan not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get user email
    const { data: { user }, error: userError } = await supabaseAdmin.auth.admin.getUserById(scan.user_id);
    if (userError || !user?.email) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const domain = scan.domains?.domain || 'unknown';
    const scanType = scan.scan_type === 'quick' ? 'Quick Scan' : 'Full Scan';
    const totalFindings = (scan.critical_count || 0) + (scan.high_count || 0) + (scan.medium_count || 0) + (scan.low_count || 0) + (scan.info_count || 0);

    // Build severity summary
    const severityParts: string[] = [];
    if (scan.critical_count > 0) severityParts.push(`${scan.critical_count} Critical`);
    if (scan.high_count > 0) severityParts.push(`${scan.high_count} High`);
    if (scan.medium_count > 0) severityParts.push(`${scan.medium_count} Medium`);
    if (scan.low_count > 0) severityParts.push(`${scan.low_count} Low`);
    if (scan.info_count > 0) severityParts.push(`${scan.info_count} Info`);
    const severitySummary = severityParts.length > 0 ? severityParts.join(', ') : 'No issues found';

    const siteUrl = Deno.env.get('SITE_URL') || 'https://aidream.hu/auradef';

    // Send email using Resend API or SMTP
    // For now, we'll use a simple approach: store the notification in a table
    // and use Supabase's built-in email hook, or we can use the Resend API

    // Try using fetch to a simple email service
    // For MVP: we'll use Supabase's inbuilt auth email by sending a magic link
    // with a custom redirect that includes scan info

    // Actually, the simplest approach: use Supabase Edge Function with fetch to an SMTP relay
    // For now, let's use the Supabase auth.admin.generateLink approach to send a custom email

    // Simplest MVP: Send via Supabase's auth email infrastructure
    const emailHtml = `
      <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; background: #111827; color: #f3f4f6; padding: 32px; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #10b981; margin: 0;">🛡 AuraDEF</h1>
          <p style="color: #9ca3af; margin: 8px 0 0;">Vulnerability Scan Report</p>
        </div>

        <div style="background: #1f2937; border: 1px solid #374151; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
          <h2 style="color: #f3f4f6; margin: 0 0 12px;">${scanType} completed for ${domain}</h2>
          <p style="color: #9ca3af; margin: 0;">Total findings: <strong style="color: #f3f4f6;">${totalFindings}</strong></p>
          <p style="color: #9ca3af; margin: 8px 0 0;">${severitySummary}</p>
        </div>

        ${scan.critical_count > 0 ? '<div style="background: #7f1d1d; border: 1px solid #991b1b; border-radius: 8px; padding: 12px; margin-bottom: 12px; color: #fca5a5;">⚠️ Critical vulnerabilities found! Immediate action recommended.</div>' : ''}

        <div style="text-align: center; margin-top: 24px;">
          <a href="${siteUrl}/scan/${scanId}" style="display: inline-block; background: #059669; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">View Full Results</a>
        </div>

        <p style="color: #6b7280; font-size: 12px; text-align: center; margin-top: 24px;">
          This email was sent by AuraDEF Security Scanner.<br>
          You received this because a scan was initiated from your account.
        </p>
      </div>
    `;

    // Use Resend API if available, otherwise log
    const resendApiKey = Deno.env.get('RESEND_API_KEY');

    if (resendApiKey) {
      const emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: 'AuraDEF <noreply@auradef.com>',
          to: [user.email],
          subject: `[AuraDEF] ${scanType} complete for ${domain} — ${totalFindings} findings`,
          html: emailHtml,
        }),
      });

      if (!emailResponse.ok) {
        const errText = await emailResponse.text();
        console.error('Resend error:', errText);
        // Don't fail the whole request, just log
      }
    } else {
      // Fallback: just log that we would send an email
      console.log(`[EMAIL] Would send to ${user.email}: ${scanType} complete for ${domain} — ${totalFindings} findings`);
    }

    return new Response(JSON.stringify({ sent: true, email: user.email }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('Email error:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
