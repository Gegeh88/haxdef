/**
 * Nuclei Diagnostic Script
 * Runs a minimal test to identify why Nuclei RPS is 0.
 * Tests: DNS, network, templates, single-threaded scan.
 */

const { runCommand } = require('./lib/process-runner');
const fs = require('fs');
const path = require('path');
const os = require('os');

// testphp.vulnweb.com is down — use own domain for testing
const TARGET = 'https://aidream.hu';
const HOME = process.env.HOME || '/home/scanner';
const TEMPLATE_DIR = `${HOME}/nuclei-templates`;

async function diagnose() {
  console.log('=== NUCLEI DIAGNOSTIC START ===');
  console.log(`Time: ${new Date().toISOString()}`);
  console.log(`HOME: ${HOME}`);
  console.log(`Target: ${TARGET}`);
  console.log();

  // Step 1: Check nuclei version
  console.log('--- STEP 1: Nuclei Version ---');
  const { stdout: ver, stderr: verErr } = await runCommand('nuclei', ['-version'], { timeout: 10000 });
  console.log((ver + verErr).trim());
  console.log();

  // Step 2: Check network connectivity
  console.log('--- STEP 2: Network Test ---');
  try {
    const { stdout: curlOut, stderr: curlErr, code: curlCode } = await runCommand('curl', [
      '-s', '-o', '/dev/null', '-w', '%{http_code} %{time_total}s',
      '--max-time', '10',
      TARGET
    ], { timeout: 15000 });
    console.log(`curl ${TARGET}: HTTP ${curlOut.trim()} (exit: ${curlCode})`);
  } catch (e) {
    console.log(`curl failed: ${e.message}`);
  }
  console.log();

  // Step 3: DNS resolution test
  console.log('--- STEP 3: DNS Resolution ---');
  try {
    const { stdout: digOut, code: digCode } = await runCommand('dig', ['+short', 'testphp.vulnweb.com'], { timeout: 10000 });
    console.log(`dig testphp.vulnweb.com: ${digOut.trim()} (exit: ${digCode})`);
  } catch (e) {
    console.log(`dig failed: ${e.message}`);
  }

  try {
    const { stdout: digOut2 } = await runCommand('dig', ['+short', 'aidream.hu'], { timeout: 10000 });
    console.log(`dig aidream.hu: ${digOut2.trim()}`);
  } catch (e) {
    console.log(`dig aidream.hu failed: ${e.message}`);
  }

  // Check /etc/resolv.conf
  try {
    const { stdout: resolvConf } = await runCommand('cat', ['/etc/resolv.conf'], { timeout: 5000 });
    console.log(`resolv.conf: ${resolvConf.trim()}`);
  } catch (e) {
    console.log(`resolv.conf read failed: ${e.message}`);
  }
  console.log();

  // Step 4: Check templates
  console.log('--- STEP 4: Template Check ---');
  const testTemplates = [
    `${TEMPLATE_DIR}/http/misconfiguration/http-missing-security-headers.yaml`,
    `${TEMPLATE_DIR}/http/technologies/tech-detect.yaml`,
    `${TEMPLATE_DIR}/http/misconfiguration/missing-x-frame-options.yaml`,
  ];

  // Find actually existing templates
  const existingTemplates = [];
  for (const t of testTemplates) {
    try {
      const { code } = await runCommand('test', ['-f', t], { timeout: 3000 });
      if (code === 0) {
        existingTemplates.push(t);
        console.log(`  EXISTS: ${path.basename(t)}`);
      } else {
        console.log(`  MISSING: ${path.basename(t)}`);
      }
    } catch {
      console.log(`  CHECK FAILED: ${path.basename(t)}`);
    }
  }

  // If none found, search for some
  if (existingTemplates.length === 0) {
    console.log('  Looking for alternative templates...');
    const { stdout: findOut } = await runCommand('find', [
      TEMPLATE_DIR, '-name', '*.yaml', '-path', '*/http/*', '-type', 'f'
    ], { timeout: 15000 });
    const allTemplates = findOut.split('\n').filter(l => l.trim());
    console.log(`  Found ${allTemplates.length} HTTP templates total`);
    // Pick first 3
    existingTemplates.push(...allTemplates.slice(0, 3));
    console.log(`  Using: ${existingTemplates.map(t => path.basename(t)).join(', ')}`);
  }
  console.log();

  if (existingTemplates.length === 0) {
    console.log('ERROR: No templates found! Cannot continue.');
    return;
  }

  // Step 5: Run nuclei with SINGLE template, debug mode, 1 thread + DNS fix
  console.log('--- STEP 5: Single Template Test (with -debug + DNS fix) ---');
  const resolverFile = path.join(os.tmpdir(), 'resolvers-diag.txt');
  fs.writeFileSync(resolverFile, '8.8.8.8:53\n8.8.4.4:53\n1.1.1.1:53\n');
  console.log('  Created resolver file with public DNS servers');

  const outputFile = path.join(os.tmpdir(), `nuclei-diag-${Date.now()}.jsonl`);
  const templateToTest = existingTemplates[0];
  console.log(`Template: ${path.basename(templateToTest)}`);
  console.log(`Command: nuclei -u ${TARGET} -t ${templateToTest} -debug -c 1 -rl 5 -timeout 30 -system-resolvers -r resolvers.txt -no-mhe`);
  console.log();

  try {
    const { stdout, stderr, code } = await runCommand('nuclei', [
      '-u', TARGET,
      '-t', templateToTest,
      '-debug',
      '-c', '1',
      '-rl', '5',
      '-timeout', '30',
      '-duc',
      '-system-resolvers',
      '-r', resolverFile,
      '-no-mhe',
      '-je', outputFile,
      '-no-color',
      '-stats',
    ], { timeout: 120000 }); // 2 min max

    console.log(`Exit code: ${code}`);
    console.log(`--- STDOUT (last 2000 chars) ---`);
    console.log((stdout || '').slice(-2000));
    console.log(`--- STDERR (last 2000 chars) ---`);
    console.log((stderr || '').slice(-2000));

    if (fs.existsSync(outputFile)) {
      const content = fs.readFileSync(outputFile, 'utf8').trim();
      console.log(`Output file: ${content.length} bytes`);
      console.log(`Content: ${content.slice(0, 1000)}`);
      fs.unlinkSync(outputFile);
    } else {
      console.log('No output file created.');
    }
  } catch (e) {
    console.log(`ERROR: ${e.message}`);
  }
  console.log();

  // Step 6: Run with 3 templates, NO debug (to see if it actually matches)
  console.log('--- STEP 6: Multi-template Test (no debug, 3 templates) ---');
  const outputFile2 = path.join(os.tmpdir(), `nuclei-diag2-${Date.now()}.jsonl`);
  const templateArgs = [];
  for (const t of existingTemplates) {
    templateArgs.push('-t', t);
  }

  try {
    const { stdout, stderr, code } = await runCommand('nuclei', [
      '-u', TARGET,
      ...templateArgs,
      '-c', '3',
      '-rl', '10',
      '-timeout', '30',
      '-duc',
      '-system-resolvers',
      '-r', resolverFile,
      '-no-mhe',
      '-je', outputFile2,
      '-no-color',
      '-stats',
      '-stats-interval', '10',
    ], { timeout: 120000 });

    console.log(`Exit code: ${code}`);
    console.log(`--- STDOUT (last 1000) ---`);
    console.log((stdout || '').slice(-1000));
    console.log(`--- STDERR (last 1000) ---`);
    console.log((stderr || '').slice(-1000));

    if (fs.existsSync(outputFile2)) {
      const content = fs.readFileSync(outputFile2, 'utf8').trim();
      console.log(`Output file: ${content.length} bytes`);
      console.log(`Content: ${content.slice(0, 1000)}`);
      fs.unlinkSync(outputFile2);
    } else {
      console.log('No output file created.');
    }
  } catch (e) {
    console.log(`ERROR: ${e.message}`);
  }
  console.log();

  // Step 7: Test with entire misconfiguration folder (broader but still small)
  console.log('--- STEP 7: Misconfiguration folder test ---');
  const outputFile3 = path.join(os.tmpdir(), `nuclei-diag3-${Date.now()}.jsonl`);
  const miscDir = `${TEMPLATE_DIR}/http/misconfiguration/`;

  // Check if dir exists
  const { code: miscDirCode } = await runCommand('test', ['-d', miscDir], { timeout: 3000 });
  if (miscDirCode !== 0) {
    // Try alternative paths
    console.log(`Directory ${miscDir} not found, searching...`);
    const { stdout: searchOut } = await runCommand('find', [
      TEMPLATE_DIR, '-type', 'd', '-name', 'misconfiguration'
    ], { timeout: 10000 });
    console.log(`Found dirs: ${searchOut.trim()}`);
  }

  try {
    const { stdout, stderr, code } = await runCommand('nuclei', [
      '-u', TARGET,
      '-t', miscDir,
      '-c', '5',
      '-rl', '20',
      '-timeout', '30',
      '-duc',
      '-system-resolvers',
      '-r', resolverFile,
      '-no-mhe',
      '-je', outputFile3,
      '-no-color',
      '-stats',
      '-stats-interval', '10',
    ], { timeout: 180000 }); // 3 min max

    console.log(`Exit code: ${code}`);
    console.log(`--- STDOUT (last 1500) ---`);
    console.log((stdout || '').slice(-1500));
    console.log(`--- STDERR (last 1500) ---`);
    console.log((stderr || '').slice(-1500));

    if (fs.existsSync(outputFile3)) {
      const content = fs.readFileSync(outputFile3, 'utf8').trim();
      console.log(`Output file: ${content.length} bytes`);
      if (content.length > 2) {
        console.log(`RESULTS FOUND! Size: ${content.length}`);
        console.log(`First 2000 chars: ${content.slice(0, 2000)}`);
      } else {
        console.log(`Empty or minimal output: "${content}"`);
      }
      fs.unlinkSync(outputFile3);
    } else {
      console.log('No output file created.');
    }
  } catch (e) {
    console.log(`ERROR: ${e.message}`);
  }

  console.log();
  console.log('=== NUCLEI DIAGNOSTIC END ===');
}

// Run standalone or export for use in worker
if (require.main === module) {
  diagnose().catch(err => {
    console.error('Diagnostic failed:', err);
    process.exit(1);
  });
}

module.exports = { diagnose };
