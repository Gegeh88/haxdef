const { runCommand } = require('../../lib/process-runner');
const { updateProgress } = require('../../lib/progress');

async function runNucleiFull(scanId, domain) {
  const findings = [];

  try {
    const { code: checkCode } = await runCommand('nuclei', ['-version'], { timeout: 10000 });
    if (checkCode !== 0) throw new Error('nuclei not found');

    // Run full nuclei scan with all templates
    const { stdout } = await runCommand('nuclei', [
      '-u', `https://${domain}`,
      '-severity', 'info,low,medium,high,critical',
      '-type', 'http',
      '-json',
      '-silent',
      '-timeout', '15',
      '-retries', '2',
      '-rate-limit', '100',
      '-bulk-size', '50',
      '-concurrency', '25',
      '-no-color',
    ], { timeout: 2400000 }); // 40 min timeout

    const lines = stdout.split('\n').filter(line => line.trim());
    let processed = 0;

    for (const line of lines) {
      try {
        const result = JSON.parse(line);
        findings.push({
          type: 'nuclei',
          title: result.info?.name || result['template-id'] || 'Unknown vulnerability',
          severity: (result.info?.severity || 'info').toLowerCase(),
          description: result.info?.description || `Found by template: ${result['template-id']}`,
          remediation: result.info?.remediation || undefined,
          evidence: result['matched-at'] || result.host || '',
          url: result['matched-at'] || `https://${domain}`,
          templateId: result['template-id'],
          tags: result.info?.tags || [],
          reference: result.info?.reference || [],
        });

        // Update progress periodically
        processed++;
        if (processed % 10 === 0) {
          const progress = Math.min(90, 51 + Math.floor((processed / Math.max(lines.length, 1)) * 40));
          await updateProgress(scanId, progress, `Nuclei: ${processed} findings processed...`);
        }
      } catch {
        // Skip unparseable lines
      }
    }

    if (findings.length === 0) {
      findings.push({
        type: 'nuclei-clean',
        title: 'No vulnerabilities found (full scan)',
        severity: 'info',
        description: 'Full Nuclei scan completed with no findings.',
        url: `https://${domain}`,
      });
    }

  } catch (err) {
    if (err.message.includes('not found') || err.message.includes('ENOENT')) {
      findings.push({
        type: 'nuclei-skipped',
        title: 'Full Nuclei scan skipped',
        severity: 'info',
        description: 'Nuclei is not installed in this environment.',
        url: `https://${domain}`,
      });
    } else {
      findings.push({
        type: 'nuclei-error',
        title: 'Full Nuclei scan error',
        severity: 'info',
        description: `Error: ${err.message}`,
        url: `https://${domain}`,
      });
    }
  }

  return findings;
}

module.exports = { runNucleiFull };
