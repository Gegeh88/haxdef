/**
 * Wapiti Target Diagnostic
 * Runs Wapiti on a SPECIFIC known-vulnerable URL with minimal modules.
 * Goal: prove Wapiti can find real high/critical vulns when crawler reaches them.
 * Time limit: 3 minutes.
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

function runWithOutput(command, args, timeoutMs) {
  return new Promise((resolve) => {
    console.log(`[RUN] ${command} ${args.join(' ')}`);
    const proc = spawn(command, args, { stdio: 'inherit' });
    const timer = setTimeout(() => {
      console.log(`[TIMEOUT] Killing after ${timeoutMs / 1000}s`);
      try { proc.kill('SIGKILL'); } catch {}
      resolve(-1);
    }, timeoutMs);
    proc.on('close', (code) => {
      clearTimeout(timer);
      console.log(`[DONE] Exit: ${code}`);
      resolve(code);
    });
    proc.on('error', (err) => {
      clearTimeout(timer);
      console.log(`[ERROR] ${err.message}`);
      resolve(-2);
    });
  });
}

async function main() {
  console.log('=== WAPITI TARGET DIAGNOSTIC ===');
  console.log(`Time: ${new Date().toISOString()}`);
  console.log();

  // demo.testfire.net is a classic vulnerable Java app — not SPA, easy to crawl
  const target = 'http://demo.testfire.net/';
  const outputFile = path.join(os.tmpdir(), `wapiti-target-${Date.now()}.json`);

  console.log(`Target: ${target}`);
  console.log(`Output: ${outputFile}`);
  console.log();

  // Test 1: SQL module only, broader scope, depth 3, 180 seconds max
  console.log('--- TEST: Wapiti SQL module on demo.testfire.net ---');
  const exitCode = await runWithOutput('/usr/local/bin/wapiti', [
    '-u', target,
    '-f', 'json',
    '-o', outputFile,
    '--scope', 'folder',
    '--max-scan-time', '180',
    '--max-attack-time', '60',
    '-m', 'sql,xss,exec',
    '-t', '10',
    '--tasks', '8',
    '-S', 'normal',
    '-d', '3',
    '-l', '1',
    '-v', '1',
    '--flush-session',
    '--no-bugreport',
    '--verify-ssl', '0',
  ], 240000); // 4 min hard timeout

  console.log();
  console.log('--- Output File Analysis ---');
  if (!fs.existsSync(outputFile)) {
    console.log('NO OUTPUT FILE!');
    return;
  }

  const content = fs.readFileSync(outputFile, 'utf8');
  console.log(`Size: ${content.length} bytes`);

  let report;
  try {
    report = JSON.parse(content);
  } catch (e) {
    console.log(`PARSE ERROR: ${e.message}`);
    console.log(`First 500 chars: ${content.slice(0, 500)}`);
    return;
  }

  // Show overall structure
  console.log(`Top-level keys: ${Object.keys(report).join(', ')}`);

  if (report.infos) {
    console.log(`Info: target=${report.infos.target}, crawled_pages=${report.infos.crawled_pages_nbr}`);
  }

  // Count by severity
  const sevCount = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 };
  let totalFindings = 0;
  if (report.vulnerabilities) {
    for (const [vulnType, list] of Object.entries(report.vulnerabilities)) {
      if (!Array.isArray(list)) continue;
      for (const v of list) {
        sevCount[v.level || 0]++;
        totalFindings++;
      }
      if (list.length > 0) {
        console.log(`  ${vulnType}: ${list.length} findings (severity levels: ${list.map(v => v.level).join(', ')})`);
      }
    }
  }

  console.log();
  console.log(`TOTAL findings: ${totalFindings}`);
  console.log(`  level 0 (info):     ${sevCount[0]}`);
  console.log(`  level 1 (low):      ${sevCount[1]}`);
  console.log(`  level 2 (medium):   ${sevCount[2]}`);
  console.log(`  level 3 (HIGH):     ${sevCount[3]}`);
  console.log(`  level 4 (CRITICAL): ${sevCount[4]}`);

  // Show first finding sample
  if (totalFindings > 0) {
    for (const [vulnType, list] of Object.entries(report.vulnerabilities)) {
      if (Array.isArray(list) && list.length > 0) {
        console.log();
        console.log('--- First finding sample ---');
        console.log(`Type: ${vulnType}`);
        const sample = list[0];
        console.log(`Method: ${sample.method}, Path: ${sample.path}`);
        console.log(`Parameter: ${sample.parameter}, Level: ${sample.level}`);
        console.log(`Module: ${sample.module}`);
        console.log(`Info: ${(sample.info || '').slice(0, 200)}`);
        console.log(`Curl: ${(sample.curl_command || '').slice(0, 200)}`);
        break;
      }
    }
  }

  try { fs.unlinkSync(outputFile); } catch {}
  console.log();
  console.log('=== DIAGNOSTIC END ===');
}

if (require.main === module) {
  main().catch(err => { console.error('FATAL:', err); process.exit(1); });
}

module.exports = { main };
