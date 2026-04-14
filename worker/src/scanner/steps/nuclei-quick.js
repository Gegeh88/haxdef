const { runCommand } = require('../../lib/process-runner');

async function runNucleiQuick(domain) {
  const findings = [];

  try {
    const { stdout: versionOut, stderr: versionErr, code: checkCode } = await runCommand('nuclei', ['-version'], { timeout: 10000 });
    console.log('[NUCLEI-QUICK] Version:', (versionOut + versionErr).trim());
    if (checkCode !== 0) throw new Error('nuclei not found');

    // Run nuclei with targeted templates (high/critical severity only for quick scan)
    const { stdout, stderr, code } = await runCommand('nuclei', [
      '-u', `https://${domain}`,
      '-severity', 'critical,high,medium',
      '-type', 'http',
      '-jsonl',
      '-timeout', '10',
      '-retries', '1',
      '-rate-limit', '50',
      '-bulk-size', '25',
      '-concurrency', '10',
      '-no-color',
      '-exclude-type', 'ssl',
    ], { timeout: 300000 }); // 5 min timeout for quick scan

    console.log(`[NUCLEI-QUICK] Exit code: ${code}`);
    console.log(`[NUCLEI-QUICK] Stdout length: ${stdout?.length || 0}`);
    console.log(`[NUCLEI-QUICK] Stderr (first 500 chars): ${stderr?.slice(0, 500)}`);

    const lines = stdout.split('\n').filter(line => line.trim());
    for (const line of lines) {
      try {
        const result = JSON.parse(line);
        findings.push({
          type: 'nuclei',
          title: result.info?.name || result['template-id'] || 'Unknown vulnerability',
          severity: (result.info?.severity || 'info').toLowerCase(),
          description: result.info?.description || `Vulnerability found by Nuclei template: ${result['template-id']}`,
          remediation: result.info?.remediation || undefined,
          evidence: result['matched-at'] || result.host || '',
          url: result['matched-at'] || `https://${domain}`,
          templateId: result['template-id'],
          tags: result.info?.tags || [],
        });
      } catch {
        // Skip unparseable lines
      }
    }

    console.log(`[NUCLEI-QUICK] Parsed ${findings.length} findings from ${lines.length} output lines`);

    if (findings.length === 0) {
      findings.push({
        type: 'nuclei-clean',
        title: 'No critical vulnerabilities found (quick scan)',
        severity: 'info',
        description: `Nuclei quick scan completed. Exit code: ${code}. Stderr: ${(stderr || '').slice(0, 200)}`,
        url: `https://${domain}`,
      });
    }

  } catch (err) {
    console.error('[NUCLEI-QUICK] Error:', err.message);
    if (err.message.includes('not found') || err.message.includes('ENOENT')) {
      findings.push({
        type: 'nuclei-skipped',
        title: 'Nuclei scan skipped',
        severity: 'info',
        description: 'Nuclei is not installed. Advanced vulnerability scanning is unavailable in this environment.',
        url: `https://${domain}`,
      });
    } else {
      findings.push({
        type: 'nuclei-error',
        title: 'Nuclei scan error',
        severity: 'info',
        description: `Nuclei scan encountered an error: ${err.message}`,
        url: `https://${domain}`,
      });
    }
  }

  return findings;
}

module.exports = { runNucleiQuick };
