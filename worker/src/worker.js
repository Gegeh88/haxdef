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

  try {
    // Check if nuclei exists
    const { stdout: version, stderr: vErr } = await runCommand('nuclei', ['-version'], { timeout: 10000 });
    console.log('[INIT] Nuclei version:', (version + vErr).trim().split('\n')[0]);

    // Count templates
    const { stdout: tl } = await runCommand('nuclei', ['-tl'], { timeout: 60000 });
    const count = (tl || '').split('\n').filter(l => l.trim()).length;
    console.log(`[INIT] Current template count: ${count}`);

    if (count < 100) {
      console.log('[INIT] Too few templates, downloading fresh...');
      const { stderr: updateOut } = await runCommand('nuclei', ['-update-templates'], { timeout: 300000 });
      console.log('[INIT] Template update output:', (updateOut || '').slice(-500));

      // Re-check
      const { stdout: tl2 } = await runCommand('nuclei', ['-tl'], { timeout: 60000 });
      const count2 = (tl2 || '').split('\n').filter(l => l.trim()).length;
      console.log(`[INIT] Template count after update: ${count2}`);

      if (count2 < 100) {
        console.error('[INIT] WARNING: Still very few templates. Nuclei scans may not find vulnerabilities.');
        // Try manual git clone as fallback
        console.log('[INIT] Trying manual template download via git...');
        const home = process.env.HOME || '/home/scanner';
        const { stderr: gitErr, code: gitCode } = await runCommand('git', [
          'clone', '--depth', '1',
          'https://github.com/projectdiscovery/nuclei-templates.git',
          `${home}/nuclei-templates`
        ], { timeout: 300000 });
        console.log(`[INIT] Git clone exit code: ${gitCode}, stderr: ${(gitErr || '').slice(-300)}`);

        // Final check
        const { stdout: tl3 } = await runCommand('nuclei', ['-tl'], { timeout: 60000 });
        const count3 = (tl3 || '').split('\n').filter(l => l.trim()).length;
        console.log(`[INIT] Final template count: ${count3}`);
      }
    }

    nucleiReady = true;
    console.log('[INIT] Nuclei ready.');
  } catch (err) {
    console.error('[INIT] Nuclei setup error:', err.message);
    console.log('[INIT] Scans will proceed but Nuclei steps may be skipped.');
    nucleiReady = true; // Still allow scans, nuclei steps will handle errors themselves
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

  setInterval(pollForScans, POLL_INTERVAL);
  pollForScans();
}

main();
