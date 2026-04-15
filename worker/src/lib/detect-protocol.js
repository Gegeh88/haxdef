const https = require('https');
const http = require('http');

/**
 * Detect which protocols (http/https) a domain supports.
 * Returns an array of working URLs like ['https://example.com', 'http://example.com']
 */
async function detectProtocols(domain) {
  const results = [];

  // Check HTTPS
  const httpsWorks = await checkUrl(`https://${domain}`);
  if (httpsWorks) results.push(`https://${domain}`);

  // Check HTTP
  const httpWorks = await checkUrl(`http://${domain}`);
  if (httpWorks) results.push(`http://${domain}`);

  // Fallback: if nothing works, try HTTP anyway
  if (results.length === 0) {
    results.push(`http://${domain}`);
  }

  console.log(`[PROTOCOL] ${domain}: ${results.join(', ')}`);
  return results;
}

function checkUrl(url) {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, { timeout: 5000 }, (res) => {
      res.resume();
      resolve(true);
    });
    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
  });
}

module.exports = { detectProtocols };
