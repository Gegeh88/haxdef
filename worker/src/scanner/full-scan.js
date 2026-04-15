const { updateProgress, completeScan } = require('../lib/progress');
const { checkHeaders } = require('./steps/headers-check');
const { checkSSL } = require('./steps/ssl-check');
const { scanPorts } = require('./steps/ports-scan');
const { detectTech } = require('./steps/tech-detect');
const { checkDNS } = require('./steps/dns-check');
const { runNucleiQuick } = require('./steps/nuclei-quick');
const { runNucleiFull } = require('./steps/nuclei-full');
const { enumerateSubdomains } = require('./steps/subdomain-enum');
const { scanDirectories } = require('./steps/directory-scan');
const { runWapitiScan } = require('./steps/wapiti-scan');

async function runFullScan(scanId, domain) {
  const allFindings = [];

  // Steps 1-5: Quick checks (0-20%)
  await updateProgress(scanId, 0, 'Checking HTTP security headers...');
  const headerFindings = await checkHeaders(domain);
  allFindings.push(...headerFindings);

  await updateProgress(scanId, 4, 'Analyzing SSL/TLS certificate...');
  const sslFindings = await checkSSL(domain);
  allFindings.push(...sslFindings);

  await updateProgress(scanId, 8, 'Scanning common ports...');
  const portFindings = await scanPorts(domain);
  allFindings.push(...portFindings);

  await updateProgress(scanId, 12, 'Detecting technologies...');
  const techFindings = await detectTech(domain);
  allFindings.push(...techFindings);

  await updateProgress(scanId, 16, 'Checking DNS configuration...');
  const dnsFindings = await checkDNS(domain);
  allFindings.push(...dnsFindings);
  await updateProgress(scanId, 20, 'Basic checks complete');

  // Step 6: Subdomain enumeration (20-25%)
  await updateProgress(scanId, 21, 'Enumerating subdomains...');
  const subdomainFindings = await enumerateSubdomains(domain);
  allFindings.push(...subdomainFindings);
  await updateProgress(scanId, 25, 'Subdomain enumeration complete');

  // Step 7: Directory/file discovery (25-30%)
  await updateProgress(scanId, 26, 'Scanning for hidden directories and files...');
  const dirFindings = await scanDirectories(domain);
  allFindings.push(...dirFindings);
  await updateProgress(scanId, 30, 'Directory scan complete');

  // Step 8: Full Nuclei pattern scan (30-65%)
  await updateProgress(scanId, 31, 'Running full Nuclei scan (known vulnerabilities)...');
  const nucleiFullFindings = await runNucleiFull(scanId, domain);
  allFindings.push(...nucleiFullFindings);
  await updateProgress(scanId, 65, 'Nuclei scan complete');

  // Step 9: Wapiti active fuzzing — finds XSS, SQLi, SSRF, etc. (65-95%)
  await updateProgress(scanId, 66, 'Running active vulnerability scan (XSS, SQLi, SSRF, Command Injection)...');
  const wapitiFindings = await runWapitiScan(domain, 'full');
  allFindings.push(...wapitiFindings);
  await updateProgress(scanId, 95, 'Active scan complete');

  // Complete
  await completeScan(scanId, allFindings);
  return allFindings;
}

module.exports = { runFullScan };
