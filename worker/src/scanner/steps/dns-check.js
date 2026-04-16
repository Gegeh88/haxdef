const dns = require('dns');
const { promisify } = require('util');
const { parseDomain } = require('../../lib/parse-domain');

const resolveTxt = promisify(dns.resolveTxt);
const resolveMx = promisify(dns.resolveMx);
const resolveNs = promisify(dns.resolveNs);
const resolveCname = promisify(dns.resolveCname);
const resolve4 = promisify(dns.resolve4);

async function checkDNS(domainInput) {
  const { hostname: domain } = parseDomain(domainInput);
  const findings = [];

  // Check SPF record
  try {
    const txtRecords = await resolveTxt(domain);
    const spfRecords = txtRecords.flat().filter(r => r.startsWith('v=spf1'));

    if (spfRecords.length === 0) {
      findings.push({
        type: 'dns-no-spf',
        title: 'No SPF record found',
        severity: 'medium',
        description: 'SPF (Sender Policy Framework) helps prevent email spoofing. Without it, attackers can send emails pretending to be from your domain.',
        remediation: 'Add a TXT record with your SPF policy. Example: v=spf1 include:_spf.google.com ~all',
        url: domain,
      });
    } else {
      findings.push({
        type: 'dns-spf-ok',
        title: 'SPF record found',
        severity: 'info',
        description: `SPF record: ${spfRecords[0]}`,
        evidence: spfRecords[0],
        url: domain,
      });
    }

    // Check DMARC
    try {
      const dmarcRecords = await resolveTxt(`_dmarc.${domain}`);
      const dmarc = dmarcRecords.flat().find(r => r.startsWith('v=DMARC1'));

      if (dmarc) {
        findings.push({
          type: 'dns-dmarc-ok',
          title: 'DMARC record found',
          severity: 'info',
          description: `DMARC policy configured: ${dmarc}`,
          evidence: dmarc,
          url: domain,
        });
      } else {
        findings.push({
          type: 'dns-no-dmarc',
          title: 'No DMARC record found',
          severity: 'medium',
          description: 'DMARC protects against email spoofing and phishing. Without it, your domain is vulnerable to being impersonated.',
          remediation: 'Add a TXT record at _dmarc.yourdomain.com. Example: v=DMARC1; p=quarantine; rua=mailto:dmarc@yourdomain.com',
          url: domain,
        });
      }
    } catch {
      findings.push({
        type: 'dns-no-dmarc',
        title: 'No DMARC record found',
        severity: 'medium',
        description: 'DMARC protects against email spoofing. No _dmarc record exists for this domain.',
        remediation: 'Add a DMARC TXT record at _dmarc.yourdomain.com',
        url: domain,
      });
    }

  } catch (err) {
    findings.push({
      type: 'dns-error',
      title: 'Could not check TXT records',
      severity: 'info',
      description: `DNS TXT lookup failed: ${err.message}`,
      url: domain,
    });
  }

  // Check MX records
  try {
    const mxRecords = await resolveMx(domain);
    if (mxRecords.length > 0) {
      findings.push({
        type: 'dns-mx',
        title: `${mxRecords.length} MX record(s) found`,
        severity: 'info',
        description: `Mail servers: ${mxRecords.map(r => r.exchange).join(', ')}`,
        evidence: JSON.stringify(mxRecords),
        url: domain,
      });
    }
  } catch {
    // No MX records is fine for non-email domains
  }

  // Check NS records
  try {
    const nsRecords = await resolveNs(domain);
    findings.push({
      type: 'dns-ns',
      title: `Nameservers: ${nsRecords.length} found`,
      severity: 'info',
      description: `Nameservers: ${nsRecords.join(', ')}`,
      evidence: nsRecords.join(', '),
      url: domain,
    });
  } catch {
    // Ignore
  }

  // Check DNSSEC (basic check - see if RRSIG exists)
  try {
    const resolver = new dns.Resolver();
    resolver.setServers(['8.8.8.8']);
    // Simple check: try to resolve and note
    await resolve4(domain);
    findings.push({
      type: 'dns-dnssec-note',
      title: 'DNSSEC check',
      severity: 'info',
      description: 'Basic DNS resolution works. Full DNSSEC validation requires specialized tools.',
      url: domain,
    });
  } catch {
    // Ignore
  }

  return findings;
}

module.exports = { checkDNS };
