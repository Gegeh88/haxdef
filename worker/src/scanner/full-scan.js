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

async function runFullScan(scanId, domain) {
  const allFindings = [];

  // Steps 1-6: Same as quick scan (0-30%)
  await updateProgress(scanId, 0, 'Checking HTTP security headers...');
  const headerFindings = await checkHeaders(domain);
  allFindings.push(...headerFindings);

  await updateProgress(scanId, 5, 'Analyzing SSL/TLS certificate...');
  const sslFindings = await checkSSL(domain);
  allFindings.push(...sslFindings);

  await updateProgress(scanId, 10, 'Scanning common ports...');
  const portFindings = await scanPorts(domain);
  allFindings.push(...portFindings);

  await updateProgress(scanId, 15, 'Detecting technologies...');
  const techFindings = await detectTech(domain);
  allFindings.push(...techFindings);

  await updateProgress(scanId, 20, 'Checking DNS configuration...');
  const dnsFindings = await checkDNS(domain);
  allFindings.push(...dnsFindings);

  await updateProgress(scanId, 25, 'Running basic vulnerability scan...');
  const nucleiQuickFindings = await runNucleiQuick(domain);
  allFindings.push(...nucleiQuickFindings);
  await updateProgress(scanId, 30, 'Basic checks complete');

  // Step 7: Subdomain enumeration (30-40%)
  await updateProgress(scanId, 31, 'Enumerating subdomains...');
  const subdomainFindings = await enumerateSubdomains(domain);
  allFindings.push(...subdomainFindings);
  await updateProgress(scanId, 40, 'Subdomain enumeration complete');

  // Step 8: Directory/file discovery (40-50%)
  await updateProgress(scanId, 41, 'Scanning for hidden directories and files...');
  const dirFindings = await scanDirectories(domain);
  allFindings.push(...dirFindings);
  await updateProgress(scanId, 50, 'Directory scan complete');

  // Step 9: Full Nuclei scan (50-95%)
  await updateProgress(scanId, 51, 'Running comprehensive Nuclei scan (this may take a while)...');
  const nucleiFullFindings = await runNucleiFull(scanId, domain);
  allFindings.push(...nucleiFullFindings);
  await updateProgress(scanId, 95, 'Nuclei scan complete');

  // Complete
  await completeScan(scanId, allFindings);
  return allFindings;
}

module.exports = { runFullScan };
