/**
 * Vulntest Diagnostic
 * Runs Wapiti against our intentionally vulnerable test page at
 * https://aidream.hu/vulntest/. Verifies the scanner finds all 6
 * known vulnerabilities (2 critical, 2 high, 2 medium).
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
    proc.on('close', (code) => { clearTimeout(timer); resolve(code); });
    proc.on('error', (err) => { clearTimeout(timer); console.log(`[ERR] ${err.message}`); resolve(-2); });
  });
}

async function main() {
  console.log('=== VULNTEST DIAGNOSTIC ===');
  console.log(`Time: ${new Date().toISOString()}`);

  const target = 'https://aidream.hu/vulntest/';
  const outputFile = path.join(os.tmpdir(), `wapiti-vulntest-${Date.now()}.json`);

  console.log(`Target: ${target}`);
  console.log(`Expected vulns: 2 critical (SQLi, cmd inj), 2 high (XSS, LFI), 2 medium (open redirect, missing headers)`);
  console.log();

  console.log('--- Wapiti scan with all relevant modules (5 min max) ---');
  const exitCode = await runWithOutput('/usr/local/bin/wapiti', [
    '-u', target,
    '-f', 'json',
    '-o', outputFile,
    '--scope', 'folder',
    '--max-scan-time', '300',
    '--max-attack-time', '60',
    '-m', 'sql,xss,exec,file,redirect,http_headers,csp,cookieflags,information_disclosure',
    '-t', '15',
    '--tasks', '8',
    '-S', 'normal',
    '-d', '5',
    '-l', '2',  // higher attack level for thorough testing
    '-v', '1',
    '--flush-session',
    '--no-bugreport',
    '--verify-ssl', '0',
  ], 360000); // 6 min hard timeout

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
    return;
  }

  console.log(`Top-level keys: ${Object.keys(report).join(', ')}`);
  if (report.infos) {
    console.log(`Crawled pages: ${report.infos.crawled_pages_nbr}`);
  }

  // Count findings by type
  const expectedTypes = {
    'SQL Injection': 'CRITICAL',
    'Command execution': 'CRITICAL',
    'Cross Site Scripting': 'HIGH',
    'Path Traversal': 'HIGH',
    'Open Redirect': 'MEDIUM',
    'Content Security Policy': 'MEDIUM',
    'HTTP Headers': 'MEDIUM',
  };

  console.log();
  console.log('--- WAPITI FINDINGS ---');
  let totalFindings = 0;
  const foundTypes = {};

  if (report.vulnerabilities) {
    for (const [vulnType, vulnList] of Object.entries(report.vulnerabilities)) {
      if (!Array.isArray(vulnList) || vulnList.length === 0) continue;
      foundTypes[vulnType] = vulnList.length;
      totalFindings += vulnList.length;
      console.log(`  ${vulnType}: ${vulnList.length} findings`);
      // Show first match details
      const first = vulnList[0];
      console.log(`    → ${first.method} ${first.path}?${first.parameter}=...`);
      console.log(`    → Module: ${first.module}, Level: ${first.level}`);
    }
  }

  if (report.additionals) {
    console.log();
    console.log('--- WAPITI ADDITIONALS ---');
    for (const [type, list] of Object.entries(report.additionals)) {
      if (Array.isArray(list) && list.length > 0) {
        console.log(`  ${type}: ${list.length}`);
      }
    }
  }

  if (report.anomalies) {
    console.log();
    console.log('--- WAPITI ANOMALIES ---');
    for (const [type, list] of Object.entries(report.anomalies)) {
      if (Array.isArray(list) && list.length > 0) {
        console.log(`  ${type}: ${list.length}`);
      }
    }
  }

  console.log();
  console.log('--- VERIFICATION CHECKLIST ---');
  const checks = [
    { name: 'CRITICAL: SQL Injection', match: (k) => k.toLowerCase().includes('sql') },
    { name: 'CRITICAL: Command Execution', match: (k) => k.toLowerCase().includes('command') || k.toLowerCase().includes('exec') },
    { name: 'HIGH: XSS', match: (k) => k.toLowerCase().includes('cross site scripting') || k.toLowerCase().includes('xss') },
    { name: 'HIGH: Path Traversal / File Inclusion', match: (k) => k.toLowerCase().includes('path traversal') || k.toLowerCase().includes('file') || k.toLowerCase().includes('inclusion') },
    { name: 'MEDIUM: Open Redirect', match: (k) => k.toLowerCase().includes('redirect') },
    { name: 'MEDIUM: Missing Security Headers', match: (k) => k.toLowerCase().includes('header') || k.toLowerCase().includes('csp') || k.toLowerCase().includes('hsts') || k.toLowerCase().includes('clickjacking') },
  ];

  for (const chk of checks) {
    const matched = Object.keys(foundTypes).find(chk.match);
    console.log(`  ${matched ? '✅' : '❌'} ${chk.name}${matched ? ` (found: "${matched}" x${foundTypes[matched]})` : ''}`);
  }

  console.log();
  console.log(`TOTAL findings: ${totalFindings}`);
  try { fs.unlinkSync(outputFile); } catch {}
  console.log('=== DIAGNOSTIC END ===');
}

if (require.main === module) {
  main().catch(err => { console.error('FATAL:', err); process.exit(1); });
}

module.exports = { main };
