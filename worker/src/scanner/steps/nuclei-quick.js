const { runCommand } = require('../../lib/process-runner');
const fs = require('fs');
const path = require('path');
const os = require('os');

async function runNucleiQuick(domain) {
  const findings = [];
  const outputFile = path.join(os.tmpdir(), `nuclei-quick-${Date.now()}.jsonl`);

  try {
    const { stdout: versionOut, stderr: versionErr, code: checkCode } = await runCommand('nuclei', ['-version'], { timeout: 10000 });
    console.log('[NUCLEI-QUICK] Version:', (versionOut + versionErr).trim().split('\n')[0]);
    if (checkCode !== 0) throw new Error('nuclei not found');

    const home = process.env.HOME || '/home/scanner';
    const templateDir = `${home}/nuclei-templates`;

    const { stdout, stderr, code } = await runCommand('nuclei', [
      '-u', `https://${domain}`,
      '-t', templateDir,
      '-severity', 'critical,high,medium',
      '-type', 'http',
      '-je', outputFile,
      '-duc',
      '-timeout', '10',
      '-retries', '1',
      '-rate-limit', '50',
      '-bulk-size', '25',
      '-concurrency', '10',
      '-no-color',
      '-exclude-type', 'ssl',
    ], { timeout: 300000 }); // 5 min timeout

    console.log(`[NUCLEI-QUICK] Exit code: ${code}`);
    console.log(`[NUCLEI-QUICK] Stderr (last 500): ${(stderr || '').slice(-500)}`);

    // Read results from file
    let lines = [];
    if (fs.existsSync(outputFile)) {
      const content = fs.readFileSync(outputFile, 'utf8');
      lines = content.split('\n').filter(l => l.trim());
      console.log(`[NUCLEI-QUICK] Output file: ${lines.length} lines`);
      fs.unlinkSync(outputFile);
    } else {
      console.log('[NUCLEI-QUICK] No output file. Trying stdout/stderr fallback...');
      const allOutput = (stdout || '') + '\n' + (stderr || '');
      lines = allOutput.split('\n').filter(l => {
        const trimmed = l.trim();
        return trimmed.startsWith('{') && trimmed.endsWith('}');
      });
      console.log(`[NUCLEI-QUICK] Fallback: ${lines.length} JSON lines`);
    }

    for (const line of lines) {
      try {
        const result = JSON.parse(line);
        findings.push({
          type: 'nuclei',
          title: result.info?.name || result['template-id'] || 'Unknown vulnerability',
          severity: (result.info?.severity || 'info').toLowerCase(),
          description: result.info?.description || `Vulnerability found by template: ${result['template-id']}`,
          remediation: result.info?.remediation || undefined,
          evidence: result['matched-at'] || result.host || '',
          url: result['matched-at'] || `https://${domain}`,
          templateId: result['template-id'],
          tags: result.info?.tags || [],
        });
      } catch {
        // Skip
      }
    }

    console.log(`[NUCLEI-QUICK] Parsed ${findings.length} findings`);

    if (findings.length === 0) {
      findings.push({
        type: 'nuclei-clean',
        title: 'No critical vulnerabilities found (quick scan)',
        severity: 'info',
        description: `Nuclei quick scan completed. Exit code: ${code}. Output lines: ${lines.length}. Stderr: ${(stderr || '').slice(-200)}`,
        url: `https://${domain}`,
      });
    }

  } catch (err) {
    console.error('[NUCLEI-QUICK] Error:', err.message);
    try { if (fs.existsSync(outputFile)) fs.unlinkSync(outputFile); } catch {}

    if (err.message.includes('not found') || err.message.includes('ENOENT')) {
      findings.push({ type: 'nuclei-skipped', title: 'Nuclei scan skipped', severity: 'info', description: 'Nuclei is not installed.', url: `https://${domain}` });
    } else {
      findings.push({ type: 'nuclei-error', title: 'Nuclei scan error', severity: 'info', description: `Error: ${err.message}`, url: `https://${domain}` });
    }
  }

  return findings;
}

module.exports = { runNucleiQuick };
