const { supabase } = require('./lib/supabase');
const { runQuickScan } = require('./scanner/quick-scan');
const { runFullScan } = require('./scanner/full-scan');
const { failScan } = require('./lib/progress');

const POLL_INTERVAL = parseInt(process.env.POLL_INTERVAL_MS || '5000');
const MAX_CONCURRENT = parseInt(process.env.MAX_CONCURRENT_SCANS || '1');

let activeScanCount = 0;

async function pollForScans() {
  if (activeScanCount >= MAX_CONCURRENT) return;

  try {
    // Fetch next queued scan
    const { data: scans, error } = await supabase
      .from('scans')
      .select('*, domains!inner(domain, is_verified)')
      .eq('status', 'queued')
      .order('created_at', { ascending: true })
      .limit(1);

    if (error) {
      console.error('Poll error:', error.message);
      return;
    }

    if (!scans || scans.length === 0) return;

    const scan = scans[0];
    console.log(`[SCAN] Starting ${scan.scan_type} scan for ${scan.domains.domain} (${scan.id})`);

    // Claim the scan
    const { error: claimError } = await supabase
      .from('scans')
      .update({
        status: 'running',
        started_at: new Date().toISOString(),
        worker_id: process.env.HOSTNAME || 'worker-1',
      })
      .eq('id', scan.id)
      .eq('status', 'queued'); // Prevent double-claiming

    if (claimError) {
      console.error('Failed to claim scan:', claimError.message);
      return;
    }

    activeScanCount++;

    // Run scan in background (don't await in poll loop)
    executeScan(scan).finally(() => {
      activeScanCount--;
    });

  } catch (err) {
    console.error('Unexpected poll error:', err.message);
  }
}

async function executeScan(scan) {
  const domain = scan.domains.domain;

  try {
    if (scan.scan_type === 'quick') {
      await runQuickScan(scan.id, domain);
    } else {
      await runFullScan(scan.id, domain);
    }
    console.log(`[SCAN] Completed ${scan.scan_type} scan for ${domain}`);
  } catch (err) {
    console.error(`[SCAN] Failed ${scan.scan_type} scan for ${domain}:`, err.message);
    await failScan(scan.id, err.message);
  }
}

// Main loop
console.log('=== AuraDEF Scan Worker Started ===');
console.log(`Poll interval: ${POLL_INTERVAL}ms`);
console.log(`Max concurrent scans: ${MAX_CONCURRENT}`);

setInterval(pollForScans, POLL_INTERVAL);
pollForScans(); // Immediate first poll
