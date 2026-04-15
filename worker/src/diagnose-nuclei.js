/**
 * Nuclei Diagnostic Script v4
 * Uses stdio:'inherit' so nuclei output goes directly to Railway logs.
 * No buffering, no pipe issues.
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const TARGET = 'https://ginandjuice.shop';
const HOME = process.env.HOME || '/home/scanner';
const TEMPLATE_DIR = `${HOME}/nuclei-templates`;

function runDirect(command, args, timeoutMs = 120000) {
  return new Promise((resolve, reject) => {
    console.log(`  [RUN] ${command} ${args.join(' ')}`);
    const proc = spawn(command, args, {
      stdio: 'inherit', // Direct output to console!
      env: process.env,
    });

    const timer = setTimeout(() => {
      console.log(`  [TIMEOUT] Killing after ${timeoutMs / 1000}s`);
      try { proc.kill('SIGKILL'); } catch {}
      resolve(-1);
    }, timeoutMs);

    proc.on('close', (code) => {
      clearTimeout(timer);
      console.log(`  [DONE] Exit code: ${code}`);
      resolve(code);
    });

    proc.on('error', (err) => {
      clearTimeout(timer);
      console.log(`  [ERROR] ${err.message}`);
      resolve(-2);
    });
  });
}

async function diagnose() {
  console.log('=== NUCLEI DIAGNOSTIC v4 (direct output) ===');
  console.log(`Time: ${new Date().toISOString()}`);
  console.log(`DNS: `);
  try { console.log(fs.readFileSync('/etc/resolv.conf', 'utf8').trim()); } catch {}
  console.log();

  // Test 1: Minimal nuclei call — version only
  console.log('--- TEST 1: nuclei -version ---');
  await runDirect('nuclei', ['-version'], 10000);
  console.log();

  // Test 2: curl target (sanity check)
  console.log('--- TEST 2: curl target ---');
  await runDirect('curl', ['-s', '-o', '/dev/null', '-w', '%{http_code} %{time_total}s', '--max-time', '10', TARGET], 15000);
  console.log();

  // Create mini template dir with a single template
  const miniDir = path.join(os.tmpdir(), `nuclei-mini-${Date.now()}`);
  fs.mkdirSync(miniDir, { recursive: true });

  // Copy ONE template
  const srcTemplate = path.join(TEMPLATE_DIR, 'http/misconfiguration/http-missing-security-headers.yaml');
  const destTemplate = path.join(miniDir, 'http-missing-security-headers.yaml');
  try {
    fs.copyFileSync(srcTemplate, destTemplate);
    console.log(`Copied template to ${destTemplate}`);
  } catch (e) {
    // Find any template
    console.log('Main template not found, searching...');
    const { stdout } = require('child_process').execSync(
      `find ${TEMPLATE_DIR} -name "*.yaml" -path "*/http/*" -type f | head -1`
    ).toString().trim();
    if (stdout) {
      fs.copyFileSync(stdout, destTemplate);
      console.log(`Copied ${path.basename(stdout)} instead`);
    }
  }
  console.log();

  // Test 3: Nuclei with ABSOLUTE MINIMUM flags — single template, direct output
  console.log('--- TEST 3: nuclei MINIMAL (1 template, direct output) ---');
  console.log('This should show EXACTLY where nuclei hangs...');
  const exitCode = await runDirect('nuclei', [
    '-u', TARGET,
    '-t', destTemplate,
    '-duc',
    '-ni',
    '-nh',
    '-no-color',
    '-v',
  ], 90000); // 90 second timeout
  console.log();

  // Test 4: If test 3 timed out, try with explicit resolvers only
  if (exitCode === -1) {
    console.log('--- TEST 4: nuclei with resolvers file ---');
    const resolverFile = path.join(os.tmpdir(), 'resolvers.txt');
    fs.writeFileSync(resolverFile, '8.8.8.8:53\n1.1.1.1:53\n');

    await runDirect('nuclei', [
      '-u', TARGET,
      '-t', destTemplate,
      '-duc',
      '-ni',
      '-nh',
      '-system-resolvers',
      '-r', resolverFile,
      '-no-color',
      '-v',
    ], 90000);
    console.log();
  }

  // Test 5: Try nuclei health check to see what it reports
  console.log('--- TEST 5: nuclei -hc (health check) ---');
  await runDirect('nuclei', ['-hc'], 60000);
  console.log();

  // Cleanup
  try { fs.rmSync(miniDir, { recursive: true }); } catch {}

  console.log('=== NUCLEI DIAGNOSTIC v4 END ===');
}

if (require.main === module) {
  diagnose().catch(err => {
    console.error('Diagnostic failed:', err);
    process.exit(1);
  });
}

module.exports = { diagnose };
