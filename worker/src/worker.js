const { supabase } = require('./lib/supabase');
const { runQuickScan } = require('./scanner/quick-scan');
const { runFullScan } = require('./scanner/full-scan');
const { failScan } = require('./lib/progress');
const { notifyScanComplete } = require('./lib/notify');
const { runCommand } = require('./lib/process-runner');

const POLL_INTERVAL = parseInt(process.env.POLL_INTERVAL_MS || '5000');
const MAX_CONCURRENT = parseInt(process.env.MAX_CONCURRENT_SCANS || '1');

let activeScanCount = 0;
let nucleiReady = false;

async function ensureNucleiTemplates() {
  console.log('[INIT] Checking Nuclei templates...');
  const home = process.env.HOME || '/home/scanner';
  const templateDir = `${home}/nuclei-templates`;

  try {
    // Check if nuclei exists
    const { stdout: version, stderr: vErr } = await runCommand('nuclei', ['-version'], { timeout: 10000 });
    console.log('[INIT] Nuclei version:', (version + vErr).trim().split('\n')[0]);

    // Check if template directory exists (fast file check, no nuclei -tl)
    const { stdout: lsOut, code: lsCode } = await runCommand('ls', [templateDir], { timeout: 5000 });
    const hasDirs = (lsOut || '').split('\n').filter(l => l.trim()).length;
    console.log(`[INIT] Template dir contents: ${hasDirs} items (code: ${lsCode})`);

    if (lsCode !== 0 || hasDirs < 5) {
      console.log('[INIT] Templates missing, downloading via git clone...');
      const { code: gitCode } = await runCommand('git', [
        'clone', '--depth', '1',
        'https://github.com/projectdiscovery/nuclei-templates.git',
        templateDir
      ], { timeout: 300000 });
      console.log(`[INIT] Git clone exit code: ${gitCode}`);
    }

    // Count yaml files (fast)
    const { stdout: countOut } = await runCommand('find', [templateDir, '-name', '*.yaml', '-type', 'f'], { timeout: 30000 });
    const yamlCount = (countOut || '').split('\n').filter(l => l.trim()).length;
    console.log(`[INIT] YAML templates found: ${yamlCount}`);

    nucleiReady = true;
    console.log('[INIT] Nuclei ready.');
  } catch (err) {
    console.error('[INIT] Nuclei setup error:', err.message);
    nucleiReady = true; // Still allow scans
  }
}

async function pollForScans() {
  if (activeScanCount >= MAX_CONCURRENT) return;

  try {
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

    const { error: claimError } = await supabase
      .from('scans')
      .update({
        status: 'running',
        started_at: new Date().toISOString(),
        worker_id: process.env.HOSTNAME || 'worker-1',
      })
      .eq('id', scan.id)
      .eq('status', 'queued');

    if (claimError) {
      console.error('Failed to claim scan:', claimError.message);
      return;
    }

    activeScanCount++;

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
    await notifyScanComplete(scan.id);
  } catch (err) {
    console.error(`[SCAN] Failed ${scan.scan_type} scan for ${domain}:`, err.message);
    await failScan(scan.id, err.message);
    await notifyScanComplete(scan.id);
  }
}

// Startup
async function main() {
  console.log('=== AuraDEF Scan Worker Started ===');
  console.log(`Poll interval: ${POLL_INTERVAL}ms`);
  console.log(`Max concurrent scans: ${MAX_CONCURRENT}`);
  console.log(`HOME: ${process.env.HOME}`);

  // Ensure templates are ready before accepting scans
  await ensureNucleiTemplates();

  // Reset any scans stuck in "running" from previous container
  try {
    const { data: stuck } = await supabase
      .from('scans')
      .update({ status: 'queued', worker_id: null })
      .eq('status', 'running')
      .select('id');
    if (stuck && stuck.length > 0) {
      console.log(`[INIT] Reset ${stuck.length} stuck scans to queued`);
    }
  } catch (err) {
    console.error('[INIT] Failed to reset stuck scans:', err.message);
  }

  // Run connection diagnostic if env var is set (fast, ~1 minute)
  if (process.env.DIAGNOSE_CONNECTIONS === 'true') {
    console.log('[INIT] Running connection diagnostics...');
    try {
      const { main: diagConn } = require('./diagnose-connections');
      await diagConn();
    } catch (err) {
      console.error('[INIT] Connection diagnostic error:', err.message);
    }
    console.log('[INIT] Connection diagnostic done.');
  }

  // Run Nuclei diagnostic if env var is set
  if (process.env.NUCLEI_DIAGNOSE === 'true') {
    console.log('[INIT] Running Nuclei diagnostics...');
    try {
      const { diagnose } = require('./diagnose-nuclei');
      await diagnose();
    } catch (err) {
      console.error('[INIT] Diagnostic error:', err.message);
    }
    console.log('[INIT] Diagnostic done. Starting normal polling...');
  }

  setInterval(pollForScans, POLL_INTERVAL);
  pollForScans();
}

main();
