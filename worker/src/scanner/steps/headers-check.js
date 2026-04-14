const https = require('https');
const http = require('http');

const SECURITY_HEADERS = {
  'strict-transport-security': {
    name: 'Strict-Transport-Security (HSTS)',
    severity: 'medium',
    description: 'Forces browsers to use HTTPS. Prevents downgrade attacks.',
    fix: 'Add header: Strict-Transport-Security: max-age=31536000; includeSubDomains',
  },
  'content-security-policy': {
    name: 'Content-Security-Policy (CSP)',
    severity: 'medium',
    description: 'Prevents XSS and data injection attacks by restricting resource origins.',
    fix: "Add a Content-Security-Policy header. Start with: Content-Security-Policy: default-src 'self'",
  },
  'x-content-type-options': {
    name: 'X-Content-Type-Options',
    severity: 'low',
    description: 'Prevents MIME-type sniffing.',
    fix: 'Add header: X-Content-Type-Options: nosniff',
  },
  'x-frame-options': {
    name: 'X-Frame-Options',
    severity: 'medium',
    description: 'Prevents clickjacking by controlling if the page can be embedded in iframes.',
    fix: 'Add header: X-Frame-Options: DENY (or SAMEORIGIN)',
  },
  'x-xss-protection': {
    name: 'X-XSS-Protection',
    severity: 'low',
    description: 'Legacy XSS protection. Modern CSP is preferred, but this helps older browsers.',
    fix: 'Add header: X-XSS-Protection: 1; mode=block',
  },
  'referrer-policy': {
    name: 'Referrer-Policy',
    severity: 'low',
    description: 'Controls how much referrer information is sent with requests.',
    fix: 'Add header: Referrer-Policy: strict-origin-when-cross-origin',
  },
  'permissions-policy': {
    name: 'Permissions-Policy',
    severity: 'low',
    description: 'Controls which browser features are allowed (camera, microphone, etc).',
    fix: 'Add header: Permissions-Policy: camera=(), microphone=(), geolocation=()',
  },
};

async function checkHeaders(domain) {
  const findings = [];
  const url = `https://${domain}`;

  try {
    const headers = await fetchHeaders(url);

    for (const [headerKey, info] of Object.entries(SECURITY_HEADERS)) {
      const headerValue = headers[headerKey];
      if (!headerValue) {
        findings.push({
          type: 'missing-header',
          title: `Missing: ${info.name}`,
          severity: info.severity,
          description: info.description,
          remediation: info.fix,
          evidence: `Header "${headerKey}" not found in response`,
          url,
        });
      }
    }

    // Check for dangerous headers that leak info
    const serverHeader = headers['server'];
    if (serverHeader) {
      findings.push({
        type: 'info-leak',
        title: 'Server header exposes technology',
        severity: 'info',
        description: `The Server header reveals: "${serverHeader}". This helps attackers identify your server software.`,
        remediation: 'Remove or genericize the Server header in your web server config.',
        evidence: `Server: ${serverHeader}`,
        url,
      });
    }

    const poweredBy = headers['x-powered-by'];
    if (poweredBy) {
      findings.push({
        type: 'info-leak',
        title: 'X-Powered-By header exposes technology',
        severity: 'low',
        description: `The X-Powered-By header reveals: "${poweredBy}". This helps attackers target known vulnerabilities.`,
        remediation: 'Remove the X-Powered-By header from your server configuration.',
        evidence: `X-Powered-By: ${poweredBy}`,
        url,
      });
    }

    // If no findings, add positive result
    if (findings.length === 0) {
      findings.push({
        type: 'headers-ok',
        title: 'All security headers present',
        severity: 'info',
        description: 'All recommended security headers are properly configured.',
        url,
      });
    }

  } catch (err) {
    findings.push({
      type: 'error',
      title: 'Could not fetch headers',
      severity: 'info',
      description: `Failed to connect to ${url}: ${err.message}`,
      url,
    });
  }

  return findings;
}

function fetchHeaders(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, { timeout: 10000 }, (res) => {
      resolve(res.headers);
      res.resume(); // Consume response to free memory
    });
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Connection timed out'));
    });
  });
}

module.exports = { checkHeaders };
