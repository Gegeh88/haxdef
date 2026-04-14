const { updateProgress, completeScan } = require('../lib/progress');
const { checkHeaders } = require('./steps/headers-check');
const { checkSSL } = require('./steps/ssl-check');
const { scanPorts } = require('./steps/ports-scan');
const { detectTech } = require('./steps/tech-detect');
const { checkDNS } = require('./steps/dns-check');
const { runNucleiQuick } = require('./steps/nuclei-quick');

async function runQuickScan(scanId, domain) {
  const allFindings = [];

  // Step 1: HTTP Headers (0-15%)
  await updateProgress(scanId, 0, 'Checking HTTP security headers...');
  const headerFindings = await checkHeaders(domain);
  allFindings.push(...headerFindings);
  await updateProgress(scanId, 15, 'HTTP headers check complete');

  // Step 2: SSL/TLS (15-30%)
  await updateProgress(scanId, 16, 'Analyzing SSL/TLS certificate...');
  const sslFindings = await checkSSL(domain);
  allFindings.push(...sslFindings);
  await updateProgress(scanId, 30, 'SSL/TLS analysis complete');

  // Step 3: Port Scan (30-50%)
  await updateProgress(scanId, 31, 'Scanning common ports...');
  const portFindings = await scanPorts(domain);
  allFindings.push(...portFindings);
  await updateProgress(scanId, 50, 'Port scan complete');

  // Step 4: Technology Detection (50-65%)
  await updateProgress(scanId, 51, 'Detecting technologies...');
  const techFindings = await detectTech(domain);
  allFindings.push(...techFindings);
  await updateProgress(scanId, 65, 'Technology detection complete');

  // Step 5: DNS Configuration (65-80%)
  await updateProgress(scanId, 66, 'Checking DNS configuration...');
  const dnsFindings = await checkDNS(domain);
  allFindings.push(...dnsFindings);
  await updateProgress(scanId, 80, 'DNS check complete');

  // Step 6: Basic Nuclei (80-100%)
  await updateProgress(scanId, 81, 'Running basic vulnerability scan...');
  const nucleiFindings = await runNucleiQuick(domain);
  allFindings.push(...nucleiFindings);

  // Complete
  await completeScan(scanId, allFindings);
  return allFindings;
}

module.exports = { runQuickScan };
