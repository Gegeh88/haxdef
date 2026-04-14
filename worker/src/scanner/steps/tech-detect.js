const https = require('https');
const http = require('http');

const TECH_SIGNATURES = [
  // CMS
  { name: 'WordPress', patterns: [/wp-content/i, /wp-includes/i, /wp-json/i], category: 'CMS' },
  { name: 'Joomla', patterns: [/\/media\/jui\//i, /joomla/i], category: 'CMS' },
  { name: 'Drupal', patterns: [/\/sites\/default\//i, /drupal/i], category: 'CMS' },
  { name: 'Shopify', patterns: [/cdn\.shopify\.com/i, /shopify/i], category: 'E-commerce' },
  { name: 'Wix', patterns: [/wix\.com/i, /wixsite\.com/i], category: 'Website Builder' },
  { name: 'Squarespace', patterns: [/squarespace/i, /sqsp\.net/i], category: 'Website Builder' },

  // Frameworks
  { name: 'React', patterns: [/__react/i, /react-root/i, /_reactRootContainer/i], category: 'JS Framework' },
  { name: 'Next.js', patterns: [/__next/i, /_next\/static/i], category: 'JS Framework' },
  { name: 'Vue.js', patterns: [/vue\.js/i, /vue\.min\.js/i, /data-v-/i], category: 'JS Framework' },
  { name: 'Angular', patterns: [/ng-version/i, /angular/i], category: 'JS Framework' },
  { name: 'jQuery', patterns: [/jquery/i], category: 'JS Library' },

  // Analytics
  { name: 'Google Analytics', patterns: [/google-analytics\.com/i, /gtag/i, /googletagmanager/i], category: 'Analytics' },
  { name: 'Facebook Pixel', patterns: [/connect\.facebook\.net/i, /fbq\(/i], category: 'Analytics' },

  // CDN
  { name: 'Cloudflare', patterns: [/cloudflare/i, /cf-ray/i], category: 'CDN/Security' },
  { name: 'AWS CloudFront', patterns: [/cloudfront\.net/i], category: 'CDN' },

  // Server
  { name: 'Nginx', patterns: [/nginx/i], category: 'Web Server', headerOnly: true },
  { name: 'Apache', patterns: [/apache/i], category: 'Web Server', headerOnly: true },
  { name: 'IIS', patterns: [/microsoft-iis/i], category: 'Web Server', headerOnly: true },
];

async function detectTech(domain) {
  const findings = [];

  try {
    const { html, headers } = await fetchPage(domain);
    const detectedTech = [];

    for (const tech of TECH_SIGNATURES) {
      const searchText = tech.headerOnly
        ? JSON.stringify(headers)
        : html + JSON.stringify(headers);

      for (const pattern of tech.patterns) {
        if (pattern.test(searchText)) {
          detectedTech.push(tech);
          break;
        }
      }
    }

    if (detectedTech.length > 0) {
      for (const tech of detectedTech) {
        findings.push({
          type: 'technology',
          title: `Detected: ${tech.name}`,
          severity: 'info',
          description: `${tech.name} (${tech.category}) detected on this website.`,
          evidence: `Category: ${tech.category}`,
          url: `https://${domain}`,
        });
      }
    } else {
      findings.push({
        type: 'technology',
        title: 'No specific technologies detected',
        severity: 'info',
        description: 'Could not detect specific technologies. The site may use custom or obfuscated code.',
        url: `https://${domain}`,
      });
    }

    // Check for version exposure in meta generator
    const generatorMatch = html.match(/<meta[^>]*name=["']generator["'][^>]*content=["']([^"']+)["']/i);
    if (generatorMatch) {
      findings.push({
        type: 'info-leak',
        title: `Generator meta tag exposes: ${generatorMatch[1]}`,
        severity: 'low',
        description: `The meta generator tag reveals the CMS/version: "${generatorMatch[1]}". This helps attackers target known vulnerabilities.`,
        remediation: 'Remove the generator meta tag from your HTML.',
        evidence: `<meta name="generator" content="${generatorMatch[1]}">`,
        url: `https://${domain}`,
      });
    }

  } catch (err) {
    findings.push({
      type: 'error',
      title: 'Technology detection failed',
      severity: 'info',
      description: `Could not fetch page for tech detection: ${err.message}`,
      url: `https://${domain}`,
    });
  }

  return findings;
}

function fetchPage(domain) {
  return new Promise((resolve, reject) => {
    const url = `https://${domain}`;
    const client = url.startsWith('https') ? https : http;

    const req = client.get(url, {
      timeout: 15000,
      headers: { 'User-Agent': 'AuraDEF Security Scanner/1.0' },
    }, (res) => {
      let body = '';
      // Follow redirects
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        res.resume();
        const redirectUrl = res.headers.location.startsWith('http')
          ? res.headers.location
          : `https://${domain}${res.headers.location}`;
        const redirectClient = redirectUrl.startsWith('https') ? https : http;
        redirectClient.get(redirectUrl, { timeout: 15000 }, (redirectRes) => {
          let redirectBody = '';
          redirectRes.on('data', (chunk) => { redirectBody += chunk; });
          redirectRes.on('end', () => resolve({ html: redirectBody, headers: redirectRes.headers }));
        }).on('error', reject);
        return;
      }
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => resolve({ html: body, headers: res.headers }));
    });
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Connection timed out'));
    });
  });
}

module.exports = { detectTech };
