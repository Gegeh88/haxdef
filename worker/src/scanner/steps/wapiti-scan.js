const { runCommand } = require('../../lib/process-runner');
const { detectProtocols } = require('../../lib/detect-protocol');
const fs = require('fs');
const path = require('path');
const os = require('os');

async function runWapitiScan(domain, scanType = 'quick') {
  const findings = [];
  const outputFile = path.join(os.tmpdir(), `wapiti-${Date.now()}.json`);

  const isQuick = scanType === 'quick';
  const maxScanTime = isQuick ? 300 : 900;   // 5 min quick, 15 min full
  const maxAttackTime = isQuick ? 60 : 180;   // 1 min / 3 min per module
  const crawlDepth = isQuick ? 3 : 10;
  const modules = isQuick
    ? 'xss,sql,exec,ssrf,redirect,http_headers,csp,cookieflags'
    : 'xss,permanentxss,sql,timesql,ssrf,exec,file,redirect,crlf,xxe,log4shell,http_headers,csp,cookieflags,ssl,https_redirect,information_disclosure';

  try {
    // Check wapiti exists — try absolute path first, then PATH lookup
    let wapitiCmd = '/usr/local/bin/wapiti';
    const { code: checkCode, stdout: vOut, stderr: vErr } = await runCommand(wapitiCmd, ['--version'], { timeout: 15000 });
    console.log(`[WAPITI] Version check: code=${checkCode}, out=${(vOut + vErr).slice(0, 200)}`);
    if (checkCode !== 0) throw new Error(`wapiti --version failed with code ${checkCode}: ${(vOut + vErr).slice(0, 300)}`);

    // Detect protocols
    const urls = await detectProtocols(domain);
    const targetUrl = urls[0] || `https://${domain}`;
    console.log(`[WAPITI] Target: ${targetUrl} (${scanType} scan)`);
    console.log(`[WAPITI] Modules: ${modules}`);
    console.log(`[WAPITI] Max scan time: ${maxScanTime}s, depth: ${crawlDepth}`);

    const { code } = await runCommand(wapitiCmd, [
      '-u', targetUrl,
      '-f', 'json',
      '-o', outputFile,
      '--scope', 'folder',
      '--max-scan-time', String(maxScanTime),
      '--max-attack-time', String(maxAttackTime),
      '-m', modules,
      '-t', '10',
      '--tasks', '16',
      '-S', 'normal',
      '-d', String(crawlDepth),
      '-l', '1',
      '-v', '0',
      '--flush-session',
      '--no-bugreport',
      '--verify-ssl', '0',
    ], { timeout: (maxScanTime + 60) * 1000, inheritStdio: true });

    console.log(`[WAPITI] Exit code: ${code}`);

    // Parse JSON results
    if (fs.existsSync(outputFile)) {
      const content = fs.readFileSync(outputFile, 'utf8').trim();
      console.log(`[WAPITI] Output file size: ${content.length} bytes`);

      try {
        const report = JSON.parse(content);

        // Map severity levels: 0=info, 1=low, 2=medium, 3=high, 4=critical
        const severityMap = { 0: 'info', 1: 'low', 2: 'medium', 3: 'high', 4: 'critical' };

        // Process vulnerabilities
        if (report.vulnerabilities) {
          for (const [vulnType, vulnList] of Object.entries(report.vulnerabilities)) {
            if (!Array.isArray(vulnList)) continue;
            for (const vuln of vulnList) {
              const severity = severityMap[vuln.level] || 'info';
              const classification = report.classifications?.[vulnType] || {};

              findings.push({
                type: 'wapiti',
                title: `${vulnType}${vuln.parameter ? ` (${vuln.parameter})` : ''}`,
                severity,
                description: vuln.info || `${vulnType} found at ${vuln.path}`,
                remediation: classification.sol || undefined,
                evidence: vuln.curl_command || vuln.http_request?.slice(0, 300) || '',
                url: `${targetUrl}${vuln.path || ''}`,
                module: vuln.module,
                method: vuln.method,
                parameter: vuln.parameter,
                wstg: vuln.wstg || classification.wstg || [],
                reference: classification.ref ? Object.values(classification.ref) : [],
              });
            }
          }
        }

        // Process anomalies (server errors triggered by fuzzing)
        if (report.anomalies) {
          for (const [anomType, anomList] of Object.entries(report.anomalies)) {
            if (!Array.isArray(anomList)) continue;
            for (const anom of anomList) {
              findings.push({
                type: 'wapiti-anomaly',
                title: `${anomType}${anom.parameter ? ` (${anom.parameter})` : ''}`,
                severity: severityMap[anom.level] || 'medium',
                description: anom.info || `${anomType} at ${anom.path}`,
                url: `${targetUrl}${anom.path || ''}`,
                module: anom.module,
                method: anom.method,
                parameter: anom.parameter,
              });
            }
          }
        }

        console.log(`[WAPITI] Total findings: ${findings.length}`);
        if (findings.length > 0) {
          console.log(`[WAPITI] Sample: ${JSON.stringify(findings[0]).slice(0, 300)}`);
        }
      } catch (parseErr) {
        console.error(`[WAPITI] JSON parse error: ${parseErr.message}`);
      }

      fs.unlinkSync(outputFile);
    } else {
      console.log('[WAPITI] No output file.');
    }

  } catch (err) {
    console.error('[WAPITI] Error:', err.message);
    try { if (fs.existsSync(outputFile)) fs.unlinkSync(outputFile); } catch {}

    if (err.message.includes('not found') || err.message.includes('ENOENT')) {
      console.log('[WAPITI] Wapiti not installed, skipping.');
    } else {
      findings.push({
        type: 'wapiti-error',
        title: 'Wapiti scan error',
        severity: 'info',
        description: `Active vulnerability scan error: ${err.message}`,
        url: `https://${domain}`,
      });
    }
  }

  return findings;
}

module.exports = { runWapitiScan };
