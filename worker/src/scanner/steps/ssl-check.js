const tls = require('tls');
const https = require('https');

async function checkSSL(domain) {
  const findings = [];

  try {
    const cert = await getCertificate(domain);

    // Check expiry
    const expiryDate = new Date(cert.valid_to);
    const now = new Date();
    const daysUntilExpiry = Math.floor((expiryDate - now) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0) {
      findings.push({
        type: 'ssl-expired',
        title: 'SSL certificate has expired',
        severity: 'critical',
        description: `Certificate expired on ${cert.valid_to}. Visitors will see security warnings.`,
        remediation: 'Renew your SSL certificate immediately.',
        evidence: `Expired: ${cert.valid_to}`,
        url: `https://${domain}`,
      });
    } else if (daysUntilExpiry < 14) {
      findings.push({
        type: 'ssl-expiring-soon',
        title: 'SSL certificate expiring soon',
        severity: 'high',
        description: `Certificate expires in ${daysUntilExpiry} days (${cert.valid_to}).`,
        remediation: 'Renew your SSL certificate before it expires.',
        evidence: `Expires in ${daysUntilExpiry} days`,
        url: `https://${domain}`,
      });
    } else if (daysUntilExpiry < 30) {
      findings.push({
        type: 'ssl-expiring',
        title: 'SSL certificate expiring within 30 days',
        severity: 'medium',
        description: `Certificate expires in ${daysUntilExpiry} days (${cert.valid_to}).`,
        remediation: 'Plan to renew your SSL certificate soon.',
        evidence: `Expires in ${daysUntilExpiry} days`,
        url: `https://${domain}`,
      });
    } else {
      findings.push({
        type: 'ssl-valid',
        title: 'SSL certificate is valid',
        severity: 'info',
        description: `Certificate valid until ${cert.valid_to} (${daysUntilExpiry} days remaining).`,
        evidence: `Valid until: ${cert.valid_to}`,
        url: `https://${domain}`,
      });
    }

    // Check issuer
    const issuer = cert.issuer?.O || cert.issuer?.CN || 'Unknown';
    findings.push({
      type: 'ssl-issuer',
      title: `Certificate issued by: ${issuer}`,
      severity: 'info',
      description: `SSL certificate issuer: ${issuer}`,
      evidence: `Issuer: ${JSON.stringify(cert.issuer)}`,
      url: `https://${domain}`,
    });

    // Check subject
    const subject = cert.subject?.CN || domain;
    if (subject !== domain && subject !== `*.${domain.split('.').slice(1).join('.')}`) {
      findings.push({
        type: 'ssl-mismatch',
        title: 'SSL certificate subject mismatch',
        severity: 'high',
        description: `Certificate is for "${subject}" but domain is "${domain}".`,
        remediation: 'Get a certificate that matches your domain name.',
        evidence: `Subject: ${subject}, Domain: ${domain}`,
        url: `https://${domain}`,
      });
    }

    // Check protocol version
    const protocol = await checkProtocol(domain);
    if (protocol) {
      findings.push({
        type: 'ssl-protocol',
        title: `TLS version: ${protocol}`,
        severity: protocol.includes('1.3') ? 'info' : protocol.includes('1.2') ? 'info' : 'medium',
        description: `Server supports ${protocol}. TLS 1.2+ is recommended.`,
        evidence: `Protocol: ${protocol}`,
        url: `https://${domain}`,
      });
    }

  } catch (err) {
    if (err.code === 'ECONNREFUSED' || err.message.includes('ENOTFOUND')) {
      findings.push({
        type: 'ssl-none',
        title: 'No SSL/TLS configured',
        severity: 'critical',
        description: `Cannot establish HTTPS connection to ${domain}. The site may not have SSL configured.`,
        remediation: 'Install an SSL certificate. Use Let\'s Encrypt for free certificates.',
        url: `https://${domain}`,
      });
    } else {
      findings.push({
        type: 'ssl-error',
        title: 'SSL check error',
        severity: 'medium',
        description: `Could not check SSL: ${err.message}`,
        url: `https://${domain}`,
      });
    }
  }

  return findings;
}

function getCertificate(domain) {
  return new Promise((resolve, reject) => {
    const req = https.get(`https://${domain}`, { timeout: 10000 }, (res) => {
      const cert = res.socket.getPeerCertificate();
      if (!cert || Object.keys(cert).length === 0) {
        reject(new Error('No certificate found'));
      } else {
        resolve(cert);
      }
      res.resume();
    });
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Connection timed out'));
    });
  });
}

function checkProtocol(domain) {
  return new Promise((resolve) => {
    const socket = tls.connect(443, domain, { timeout: 10000 }, () => {
      const protocol = socket.getProtocol();
      socket.destroy();
      resolve(protocol);
    });
    socket.on('error', () => resolve(null));
    socket.on('timeout', () => {
      socket.destroy();
      resolve(null);
    });
  });
}

module.exports = { checkSSL };
