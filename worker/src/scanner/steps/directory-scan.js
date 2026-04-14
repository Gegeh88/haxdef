const https = require('https');
const http = require('http');

const COMMON_PATHS = [
  // Sensitive files
  { path: '/.env', severity: 'critical', description: 'Environment file may contain secrets/credentials' },
  { path: '/.git/config', severity: 'critical', description: 'Git repository exposed - source code leak' },
  { path: '/.git/HEAD', severity: 'critical', description: 'Git repository exposed - source code leak' },
  { path: '/.htaccess', severity: 'medium', description: 'Apache config file exposed' },
  { path: '/.htpasswd', severity: 'critical', description: 'Password file exposed' },
  { path: '/wp-config.php.bak', severity: 'critical', description: 'WordPress config backup with database credentials' },
  { path: '/backup.sql', severity: 'critical', description: 'Database backup file exposed' },
  { path: '/dump.sql', severity: 'critical', description: 'Database dump file exposed' },
  { path: '/database.sql', severity: 'critical', description: 'Database file exposed' },
  { path: '/phpinfo.php', severity: 'medium', description: 'PHP info page reveals server configuration' },
  { path: '/info.php', severity: 'medium', description: 'PHP info page reveals server configuration' },
  { path: '/server-status', severity: 'medium', description: 'Apache server status page' },
  { path: '/server-info', severity: 'medium', description: 'Apache server info page' },

  // Admin panels
  { path: '/admin', severity: 'low', description: 'Admin panel found' },
  { path: '/administrator', severity: 'low', description: 'Admin panel found' },
  { path: '/wp-admin', severity: 'info', description: 'WordPress admin panel' },
  { path: '/wp-login.php', severity: 'info', description: 'WordPress login page' },
  { path: '/phpmyadmin', severity: 'medium', description: 'phpMyAdmin database management exposed' },
  { path: '/adminer.php', severity: 'medium', description: 'Adminer database management exposed' },

  // API endpoints
  { path: '/api', severity: 'info', description: 'API endpoint found' },
  { path: '/api/v1', severity: 'info', description: 'API v1 endpoint found' },
  { path: '/api/docs', severity: 'low', description: 'API documentation exposed' },
  { path: '/swagger', severity: 'low', description: 'Swagger API documentation exposed' },
  { path: '/graphql', severity: 'info', description: 'GraphQL endpoint found' },

  // Common files
  { path: '/robots.txt', severity: 'info', description: 'Robots.txt found - may reveal hidden paths' },
  { path: '/sitemap.xml', severity: 'info', description: 'Sitemap found' },
  { path: '/crossdomain.xml', severity: 'low', description: 'Cross-domain policy file found' },
  { path: '/.well-known/security.txt', severity: 'info', description: 'Security contact file found (good practice!)' },
];

async function scanDirectories(domain) {
  const findings = [];
  const batchSize = 10;

  for (let i = 0; i < COMMON_PATHS.length; i += batchSize) {
    const batch = COMMON_PATHS.slice(i, i + batchSize);
    const results = await Promise.all(
      batch.map(({ path, severity, description }) =>
        checkPath(domain, path).then(status => ({
          path, severity, description, status,
        }))
      )
    );

    for (const { path, severity, description, status } of results) {
      if (status >= 200 && status < 400) {
        findings.push({
          type: 'directory',
          title: `Found: ${path} (HTTP ${status})`,
          severity: severity,
          description: description,
          remediation: severity === 'critical'
            ? `Remove or restrict access to ${path} immediately. This file should never be publicly accessible.`
            : severity === 'medium'
              ? `Consider restricting access to ${path} or removing it from the public web root.`
              : undefined,
          evidence: `HTTP ${status} at https://${domain}${path}`,
          url: `https://${domain}${path}`,
        });
      }
    }
  }

  if (findings.length === 0) {
    findings.push({
      type: 'directory-clean',
      title: 'No sensitive files or directories found',
      severity: 'info',
      description: 'No common sensitive files or directories were discovered.',
      url: `https://${domain}`,
    });
  }

  return findings;
}

function checkPath(domain, path) {
  return new Promise((resolve) => {
    const url = `https://${domain}${path}`;
    const client = url.startsWith('https') ? https : http;

    const req = client.get(url, {
      timeout: 5000,
      headers: { 'User-Agent': 'AuraDEF Security Scanner/1.0' },
    }, (res) => {
      res.resume();
      resolve(res.statusCode);
    });

    req.on('error', () => resolve(0));
    req.on('timeout', () => {
      req.destroy();
      resolve(0);
    });
  });
}

module.exports = { scanDirectories };
