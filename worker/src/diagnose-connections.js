/**
 * Connection Diagnostic Script
 * Tests ONLY the connections/dependencies — no actual scanning.
 * Each check has a strict timeout. Total: <2 minutes.
 */

const { spawn } = require('child_process');
const { supabase } = require('./lib/supabase');

function runCmd(command, args, timeoutMs = 10000) {
  return new Promise((resolve) => {
    let stdout = '', stderr = '';
    const proc = spawn(command, args);
    proc.stdout.on('data', (d) => stdout += d.toString());
    proc.stderr.on('data', (d) => stderr += d.toString());
    const timer = setTimeout(() => {
      try { proc.kill('SIGKILL'); } catch {}
      resolve({ code: -1, stdout, stderr, timedOut: true });
    }, timeoutMs);
    proc.on('close', (code) => { clearTimeout(timer); resolve({ code, stdout, stderr }); });
    proc.on('error', (err) => { clearTimeout(timer); resolve({ code: -2, stdout, stderr: err.message }); });
  });
}

async function check(name, fn) {
  const start = Date.now();
  try {
    const result = await fn();
    const ms = Date.now() - start;
    console.log(`[${result.ok ? 'OK ' : 'FAIL'}] ${name} (${ms}ms): ${result.msg}`);
    return result.ok;
  } catch (err) {
    const ms = Date.now() - start;
    console.log(`[FAIL] ${name} (${ms}ms): ${err.message}`);
    return false;
  }
}

async function main() {
  console.log('=== CONNECTION DIAGNOSTIC ===');
  console.log(`Time: ${new Date().toISOString()}`);
  console.log();

  // 1. Binaries exist + executable
  console.log('--- Binaries ---');
  for (const [name, cmd, args] of [
    ['nuclei', 'nuclei', ['-version']],
    ['wapiti', '/usr/local/bin/wapiti', ['--version']],
    ['nmap', 'nmap', ['--version']],
    ['subfinder', 'subfinder', ['-version']],
    ['curl', 'curl', ['--version']],
    ['python3.13', '/usr/local/bin/python3.13', ['--version']],
  ]) {
    await check(name, async () => {
      const r = await runCmd(cmd, args, 8000);
      const out = (r.stdout + r.stderr).split('\n')[0].trim();
      return { ok: r.code === 0, msg: `code=${r.code}, "${out.slice(0, 80)}"` };
    });
  }

  // 2. Network connectivity
  console.log('\n--- Network ---');
  for (const url of [
    'https://aidream.hu',
    'https://ginandjuice.shop',
    'http://demo.testfire.net',
  ]) {
    await check(`HTTP ${url}`, async () => {
      const r = await runCmd('curl', ['-s', '-o', '/dev/null', '-w', '%{http_code} %{time_total}s', '--max-time', '10', url], 12000);
      return { ok: r.stdout.startsWith('2') || r.stdout.startsWith('3'), msg: r.stdout.trim() };
    });
  }

  // 3. DNS
  console.log('\n--- DNS ---');
  await check('resolv.conf', async () => {
    const r = await runCmd('cat', ['/etc/resolv.conf'], 3000);
    return { ok: r.code === 0, msg: r.stdout.trim().split('\n').join(', ') };
  });

  // 4. Supabase connection
  console.log('\n--- Supabase ---');
  await check('Supabase client initialized', async () => {
    return { ok: !!supabase, msg: process.env.SUPABASE_URL ? 'URL set' : 'URL missing' };
  });

  await check('Supabase READ scans table', async () => {
    const { data, error } = await supabase.from('scans').select('id').limit(1);
    return { ok: !error, msg: error ? error.message : `OK (${data?.length || 0} rows)` };
  });

  await check('Supabase READ domains table', async () => {
    const { data, error } = await supabase.from('domains').select('id').limit(1);
    return { ok: !error, msg: error ? error.message : `OK (${data?.length || 0} rows)` };
  });

  // 5. Edge function reachability (just check URL responds)
  console.log('\n--- Edge Functions ---');
  await check('Edge Function send-scan-email reachable', async () => {
    const url = `${process.env.SUPABASE_URL}/functions/v1/send-scan-email`;
    try {
      const res = await fetch(url, { method: 'OPTIONS' });
      return { ok: res.status < 500, msg: `HTTP ${res.status}` };
    } catch (e) { return { ok: false, msg: e.message }; }
  });

  // 6. Filesystem permissions
  console.log('\n--- Filesystem ---');
  await check('/tmp writable', async () => {
    const r = await runCmd('sh', ['-c', 'touch /tmp/.test-write && rm /tmp/.test-write && echo OK'], 3000);
    return { ok: r.stdout.includes('OK'), msg: r.code === 0 ? 'writable' : r.stderr };
  });

  await check('Nuclei templates exist', async () => {
    const r = await runCmd('sh', ['-c', 'ls /home/scanner/nuclei-templates | wc -l'], 5000);
    const n = parseInt(r.stdout.trim());
    return { ok: n > 10, msg: `${n} dirs` };
  });

  // 7. Wapiti modules listable
  console.log('\n--- Wapiti modules ---');
  await check('wapiti --list-modules', async () => {
    const r = await runCmd('/usr/local/bin/wapiti', ['--list-modules'], 15000);
    const lines = (r.stdout + r.stderr).split('\n').filter(l => l.trim().startsWith('Module'));
    return { ok: r.code === 0 && lines.length > 5, msg: `code=${r.code}, ${lines.length} modules listed` };
  });

  console.log('\n=== DIAGNOSTIC END ===');
}

if (require.main === module) {
  main().catch(err => { console.error('FATAL:', err); process.exit(1); });
}

module.exports = { main };
