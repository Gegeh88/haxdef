/**
 * Nuclei Diagnostic Script v3
 * KEY INSIGHT: Nuclei loads ALL templates from default dir even when -t is specified.
 * Solution: Copy test templates to a MINI temp dir and use -td to override.
 */

const { runCommand } = require('./lib/process-runner');
const fs = require('fs');
const path = require('path');
const os = require('os');

const TARGET = 'https://ginandjuice.shop'; // PortSwigger vulnerable test site
const TARGET2 = 'https://aidream.hu';
const HOME = process.env.HOME || '/home/scanner';
const TEMPLATE_DIR = `${HOME}/nuclei-templates`;

async function diagnose() {
  console.log('=== NUCLEI DIAGNOSTIC v3 ===');
  console.log(`Time: ${new Date().toISOString()}`);
  console.log(`Target: ${TARGET}`);

  // Step 1: Quick checks
  console.log('\n--- STEP 1: Version + Network ---');
  const { stdout: ver, stderr: verErr } = await runCommand('nuclei', ['-version'], { timeout: 10000 });
  console.log(`Nuclei: ${(ver + verErr).trim().split('\n')[0]}`);

  for (const url of [TARGET, TARGET2]) {
    try {
      const { stdout: curlOut, code: cc } = await runCommand('curl', [
        '-s', '-o', '/dev/null', '-w', '%{http_code} %{time_total}s', '--max-time', '10', url
      ], { timeout: 15000 });
      console.log(`  curl ${url}: ${curlOut.trim()} (exit: ${cc})`);
    } catch (e) { console.log(`  curl ${url}: FAIL - ${e.message}`); }
  }

  // Check resolv.conf
  try {
    const { stdout: rc } = await runCommand('cat', ['/etc/resolv.conf'], { timeout: 3000 });
    console.log(`  resolv.conf: ${rc.trim()}`);
  } catch {}

  // Step 2: Create MINI template dir (avoid loading 12,958 templates)
  console.log('\n--- STEP 2: Create Mini Template Dir ---');
  const miniDir = path.join(os.tmpdir(), `nuclei-mini-${Date.now()}`);
  fs.mkdirSync(miniDir, { recursive: true });

  // Find and copy a few specific templates
  const templatesToCopy = [];
  const searchPaths = [
    'http/misconfiguration/http-missing-security-headers.yaml',
    'http/technologies/tech-detect.yaml',
    'http/misconfiguration/aspx-debug-mode.yaml',
    'http/exposed-panels/wordpress-login.yaml',
  ];

  for (const relPath of searchPaths) {
    const fullPath = path.join(TEMPLATE_DIR, relPath);
    try {
      const { code } = await runCommand('test', ['-f', fullPath], { timeout: 3000 });
      if (code === 0) {
        // Copy to mini dir (preserve relative structure)
        const destDir = path.join(miniDir, path.dirname(relPath));
        fs.mkdirSync(destDir, { recursive: true });
        fs.copyFileSync(fullPath, path.join(miniDir, relPath));
        templatesToCopy.push(relPath);
        console.log(`  Copied: ${relPath}`);
      }
    } catch {}
  }

  // If none found, search for any
  if (templatesToCopy.length === 0) {
    console.log('  No specific templates found, searching...');
    const { stdout: findOut } = await runCommand('find', [
      TEMPLATE_DIR, '-name', '*.yaml', '-path', '*/http/*', '-type', 'f'
    ], { timeout: 15000 });
    const found = findOut.split('\n').filter(l => l.trim()).slice(0, 5);
    for (const f of found) {
      const rel = f.replace(TEMPLATE_DIR + '/', '');
      const destDir = path.join(miniDir, path.dirname(rel));
      fs.mkdirSync(destDir, { recursive: true });
      fs.copyFileSync(f, path.join(miniDir, rel));
      templatesToCopy.push(rel);
      console.log(`  Copied: ${rel}`);
    }
  }

  // Count files in mini dir
  const { stdout: miniCount } = await runCommand('find', [miniDir, '-name', '*.yaml', '-type', 'f'], { timeout: 5000 });
  const miniTemplateCount = miniCount.split('\n').filter(l => l.trim()).length;
  console.log(`  Mini template dir: ${miniDir} (${miniTemplateCount} templates)`);

  // Create resolver file
  const resolverFile = path.join(os.tmpdir(), 'resolvers-diag.txt');
  fs.writeFileSync(resolverFile, '8.8.8.8:53\n8.8.4.4:53\n1.1.1.1:53\n');

  // Step 3: Run nuclei with MINI template dir (key test!)
  console.log('\n--- STEP 3: Nuclei with MINI template dir ---');
  const outputFile = path.join(os.tmpdir(), `nuclei-diag-${Date.now()}.jsonl`);
  const nucleiArgs = [
    '-u', TARGET,
    '-t', miniDir,
    '-c', '1',
    '-rl', '10',
    '-timeout', '30',
    '-duc',
    '-system-resolvers',
    '-r', resolverFile,
    '-no-mhe',
    '-ni',
    '-nh',
    '-je', outputFile,
    '-no-color',
    '-stats',
    '-stats-interval', '10',
    '-debug',
  ];
  console.log(`  Command: nuclei ${nucleiArgs.join(' ')}`);
  console.log(`  Timeout: 120s`);
  const startTime = Date.now();

  try {
    const { stdout, stderr, code } = await runCommand('nuclei', nucleiArgs, { timeout: 120000 });
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

    console.log(`\n  Exit code: ${code} (took ${elapsed}s)`);
    console.log(`  STDOUT (last 2000):\n${(stdout || '').slice(-2000)}`);
    console.log(`  STDERR (last 2000):\n${(stderr || '').slice(-2000)}`);

    if (fs.existsSync(outputFile)) {
      const content = fs.readFileSync(outputFile, 'utf8').trim();
      console.log(`  Output file: ${content.length} bytes`);
      if (content.length > 5) {
        console.log(`  *** RESULTS FOUND! ***`);
        console.log(`  ${content.slice(0, 3000)}`);
      } else {
        console.log(`  Empty output: "${content}"`);
      }
    } else {
      console.log('  No output file.');
    }
  } catch (e) {
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`\n  ERROR after ${elapsed}s: ${e.message}`);
    if (e.stdout) console.log(`  PARTIAL STDOUT:\n${e.stdout.slice(-2000)}`);
    if (e.stderr) console.log(`  PARTIAL STDERR:\n${e.stderr.slice(-2000)}`);
  }

  // Step 4: Same test but with FULL template dir for comparison
  console.log('\n--- STEP 4: Nuclei with FULL template dir (for comparison) ---');
  const outputFile2 = path.join(os.tmpdir(), `nuclei-diag2-${Date.now()}.jsonl`);
  const nucleiArgs2 = [
    '-u', TARGET,
    '-t', `${TEMPLATE_DIR}/http/misconfiguration/`,
    '-c', '1',
    '-rl', '10',
    '-timeout', '30',
    '-duc',
    '-system-resolvers',
    '-r', resolverFile,
    '-no-mhe',
    '-ni',
    '-nh',
    '-je', outputFile2,
    '-no-color',
    '-stats',
    '-stats-interval', '10',
  ];
  console.log(`  Command: nuclei -u ${TARGET} -t ${TEMPLATE_DIR}/http/misconfiguration/ ...`);
  console.log(`  Timeout: 180s`);
  const startTime2 = Date.now();

  try {
    const { stdout, stderr, code } = await runCommand('nuclei', nucleiArgs2, { timeout: 180000 });
    const elapsed = ((Date.now() - startTime2) / 1000).toFixed(1);

    console.log(`\n  Exit code: ${code} (took ${elapsed}s)`);
    console.log(`  STDOUT (last 1500):\n${(stdout || '').slice(-1500)}`);
    console.log(`  STDERR (last 1500):\n${(stderr || '').slice(-1500)}`);

    if (fs.existsSync(outputFile2)) {
      const content = fs.readFileSync(outputFile2, 'utf8').trim();
      console.log(`  Output file: ${content.length} bytes`);
      if (content.length > 5) {
        console.log(`  *** RESULTS FOUND! ***`);
        console.log(`  ${content.slice(0, 2000)}`);
      }
    }
  } catch (e) {
    const elapsed = ((Date.now() - startTime2) / 1000).toFixed(1);
    console.log(`\n  ERROR after ${elapsed}s: ${e.message}`);
    if (e.stdout) console.log(`  PARTIAL STDOUT:\n${e.stdout.slice(-1500)}`);
    if (e.stderr) console.log(`  PARTIAL STDERR:\n${e.stderr.slice(-1500)}`);
  }

  // Step 5: Test aidream.hu with mini dir
  console.log('\n--- STEP 5: aidream.hu with MINI template dir ---');
  const outputFile3 = path.join(os.tmpdir(), `nuclei-diag3-${Date.now()}.jsonl`);
  const startTime3 = Date.now();

  try {
    const { stdout, stderr, code } = await runCommand('nuclei', [
      '-u', TARGET2,
      '-t', miniDir,
      '-c', '1',
      '-rl', '10',
      '-timeout', '30',
      '-duc',
      '-system-resolvers',
      '-r', resolverFile,
      '-no-mhe',
      '-ni',
      '-nh',
      '-je', outputFile3,
      '-no-color',
      '-stats',
    ], { timeout: 120000 });
    const elapsed = ((Date.now() - startTime3) / 1000).toFixed(1);

    console.log(`  Exit code: ${code} (took ${elapsed}s)`);
    console.log(`  STDOUT (last 1500):\n${(stdout || '').slice(-1500)}`);
    console.log(`  STDERR (last 1500):\n${(stderr || '').slice(-1500)}`);

    if (fs.existsSync(outputFile3)) {
      const content = fs.readFileSync(outputFile3, 'utf8').trim();
      console.log(`  Output file: ${content.length} bytes`);
      if (content.length > 5) {
        console.log(`  *** RESULTS FOUND! ***`);
        console.log(`  ${content.slice(0, 2000)}`);
      }
    }
  } catch (e) {
    const elapsed = ((Date.now() - startTime3) / 1000).toFixed(1);
    console.log(`  ERROR after ${elapsed}s: ${e.message}`);
    if (e.stdout) console.log(`  PARTIAL STDOUT:\n${e.stdout.slice(-1500)}`);
    if (e.stderr) console.log(`  PARTIAL STDERR:\n${e.stderr.slice(-1500)}`);
  }

  // Cleanup
  try { await runCommand('rm', ['-rf', miniDir], { timeout: 5000 }); } catch {}
  try { fs.unlinkSync(resolverFile); } catch {}
  try { fs.unlinkSync(outputFile); } catch {}
  try { fs.unlinkSync(outputFile2); } catch {}
  try { fs.unlinkSync(outputFile3); } catch {}

  console.log('\n=== NUCLEI DIAGNOSTIC END ===');
}

if (require.main === module) {
  diagnose().catch(err => {
    console.error('Diagnostic failed:', err);
    process.exit(1);
  });
}

module.exports = { diagnose };
