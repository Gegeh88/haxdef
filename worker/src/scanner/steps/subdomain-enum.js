const { runCommand } = require('../../lib/process-runner');
const { parseDomain } = require('../../lib/parse-domain');
const dns = require('dns');
const { promisify } = require('util');
const resolve4 = promisify(dns.resolve4);

const COMMON_SUBDOMAINS = [
  'www', 'mail', 'ftp', 'admin', 'blog', 'api', 'dev', 'staging',
  'test', 'app', 'portal', 'shop', 'store', 'cdn', 'static',
  'media', 'assets', 'img', 'images', 'docs', 'help', 'support',
  'status', 'monitor', 'dashboard', 'panel', 'cpanel', 'webmail',
  'mx', 'ns1', 'ns2', 'vpn', 'remote', 'gateway', 'proxy',
  'git', 'gitlab', 'jenkins', 'ci', 'jira', 'confluence',
];

async function enumerateSubdomains(domainInput) {
  const { hostname: domain } = parseDomain(domainInput);
  const findings = [];
  let subdomains = [];

  try {
    // Try subfinder first
    const { stdout, code } = await runCommand('subfinder', [
      '-d', domain,
      '-silent',
      '-timeout', '120',
    ], { timeout: 180000 });

    if (code === 0 && stdout.trim()) {
      subdomains = stdout.trim().split('\n').filter(s => s.trim());
    } else {
      throw new Error('subfinder failed');
    }
  } catch {
    // Fallback: DNS brute force common subdomains
    subdomains = await bruteForceSubdomains(domain);
  }

  if (subdomains.length > 0) {
    findings.push({
      type: 'subdomains',
      title: `${subdomains.length} subdomain(s) discovered`,
      severity: 'info',
      description: `Found subdomains: ${subdomains.slice(0, 20).join(', ')}${subdomains.length > 20 ? ` ... and ${subdomains.length - 20} more` : ''}`,
      evidence: JSON.stringify(subdomains.slice(0, 50)),
      url: domain,
    });
  } else {
    findings.push({
      type: 'subdomains',
      title: 'No subdomains discovered',
      severity: 'info',
      description: 'No additional subdomains were found for this domain.',
      url: domain,
    });
  }

  return findings;
}

async function bruteForceSubdomains(domain) {
  const found = [];
  const checks = COMMON_SUBDOMAINS.map(async (sub) => {
    try {
      await resolve4(`${sub}.${domain}`);
      found.push(`${sub}.${domain}`);
    } catch {
      // Doesn't exist
    }
  });
  await Promise.all(checks);
  return found.sort();
}

module.exports = { enumerateSubdomains };
