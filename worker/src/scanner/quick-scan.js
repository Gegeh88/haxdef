const { updateProgress, completeScan } = require('../lib/progress');
const { checkHeaders } = require('./steps/headers-check');
const { checkSSL } = require('./steps/ssl-check');
const { scanPorts } = require('./steps/ports-scan');
const { detectTech } = require('./steps/tech-detect');
const { checkDNS } = require('./steps/dns-check');
const { runNucleiQuick } = require('./steps/nuclei-quick');
const { runWapitiScan } = require('./steps/wapiti-scan');

async function runQuickScan(scanId, domain) {
  const allFindings = [];

  // Step 1: HTTP Headers (0-10%)
  await updateProgress(scanId, 0, 'Checking HTTP security headers...');
  const headerFindings = await checkHeaders(domain);
  allFindings.push(...headerFindings);
  await updateProgress(scanId, 10, 'HTTP headers check complete');

  // Step 2: SSL/TLS (10-20%)
  await updateProgress(scanId, 11, 'Analyzing SSL/TLS certificate...');
  const sslFindings = await checkSSL(domain);
  allFindings.push(...sslFindings);
  await updateProgress(scanId, 20, 'SSL/TLS analysis complete');

  // Step 3: Port Scan (20-35%)
  await updateProgress(scanId, 21, 'Scanning common ports...');
  const portFindings = await scanPorts(domain);
  allFindings.push(...portFindings);
  await updateProgress(scanId, 35, 'Port scan complete');

  // Step 4: Technology Detection (35-45%)
  await updateProgress(scanId, 36, 'Detecting technologies...');
  const techFindings = await detectTech(domain);
  allFindings.push(...techFindings);
  await updateProgress(scanId, 45, 'Technology detection complete');

  // Step 5: DNS Configuration (45-55%)
  await updateProgress(scanId, 46, 'Checking DNS configuration...');
  const dnsFindings = await checkDNS(domain);
  allFindings.push(...dnsFindings);
  await updateProgress(scanId, 55, 'DNS check complete');

  // Step 6: Nuclei pattern scan (55-75%)
  await updateProgress(scanId, 56, 'Running vulnerability pattern scan (Nuclei)...');
  const nucleiFindings = await runNucleiQuick(domain);
  allFindings.push(...nucleiFindings);
  await updateProgress(scanId, 75, 'Pattern scan complete');

  // Step 7: Wapiti active fuzzing (75-100%)
  await updateProgress(scanId, 76, 'Running active vulnerability scan (XSS, SQLi, SSRF)...');
  const wapitiFindings = await runWapitiScan(domain, 'quick');
  allFindings.push(...wapitiFindings);

  // Complete
  await completeScan(scanId, allFindings);
  return allFindings;
}

module.exports = { runQuickScan };
