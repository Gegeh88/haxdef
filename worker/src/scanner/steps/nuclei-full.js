const { runCommand } = require('../../lib/process-runner');
const { updateProgress } = require('../../lib/progress');
const fs = require('fs');
const path = require('path');
const os = require('os');

async function runNucleiFull(scanId, domain) {
  const findings = [];
  const outputFile = path.join(os.tmpdir(), `nuclei-full-${scanId}.jsonl`);

  try {
    const { stdout: versionOut, stderr: versionErr, code: checkCode } = await runCommand('nuclei', ['-version'], { timeout: 10000 });
    console.log('[NUCLEI-FULL] Version:', (versionOut + versionErr).trim().split('\n')[0]);
    if (checkCode !== 0) throw new Error('nuclei not found');

    await updateProgress(scanId, 52, 'Running full Nuclei scan (this takes 15-40 minutes)...');

    const home = process.env.HOME || '/home/scanner';
    const templateDir = `${home}/nuclei-templates`;

    const { stdout, stderr, code } = await runCommand('nuclei', [
      '-u', `https://${domain}`,
      '-t', templateDir,
      '-severity', 'info,low,medium,high,critical',
      '-type', 'http',
      '-je', outputFile,
      '-duc',
      '-timeout', '15',
      '-retries', '2',
      '-rate-limit', '100',
      '-bulk-size', '50',
      '-concurrency', '25',
      '-no-color',
      '-stats',
      '-stats-interval', '30',
    ], { timeout: 2400000 }); // 40 min timeout

    console.log(`[NUCLEI-FULL] Exit code: ${code}`);
    console.log(`[NUCLEI-FULL] Stdout (last 500): ${(stdout || '').slice(-500)}`);
    console.log(`[NUCLEI-FULL] Stderr (last 1000): ${(stderr || '').slice(-1000)}`);

    // Read results from file
    let lines = [];
    if (fs.existsSync(outputFile)) {
      const content = fs.readFileSync(outputFile, 'utf8');
      lines = content.split('\n').filter(l => l.trim());
      console.log(`[NUCLEI-FULL] Output file: ${lines.length} lines`);
      fs.unlinkSync(outputFile); // cleanup
    } else {
      console.log('[NUCLEI-FULL] No output file created. Trying stdout...');
      // Fallback: try parsing both stdout and stderr for JSON
      const allOutput = (stdout || '') + '\n' + (stderr || '');
      lines = allOutput.split('\n').filter(l => {
        const trimmed = l.trim();
        return trimmed.startsWith('{') && trimmed.endsWith('}');
      });
      console.log(`[NUCLEI-FULL] Fallback: found ${lines.length} JSON lines in combined output`);
    }

    let processed = 0;
    for (const line of lines) {
      try {
        const result = JSON.parse(line);
        // Log first finding to understand the JSON structure
        if (processed === 0) {
          console.log('[NUCLEI-FULL] Sample finding keys:', Object.keys(result).join(', '));
          console.log('[NUCLEI-FULL] Sample finding:', JSON.stringify(result).slice(0, 500));
        }
        findings.push({
          type: 'nuclei',
          title: result.info?.name || result['template-id'] || result.templateID || result.template || 'Nuclei finding',
          severity: (result.info?.severity || result.severity || 'info').toLowerCase(),
          description: result.info?.description || result.description || `Found by template: ${result['template-id'] || result.templateID || result.template || 'unknown'}`,
          remediation: result.info?.remediation || result.remediation || undefined,
          evidence: result['matched-at'] || result.matched || result.host || result.url || '',
          url: result['matched-at'] || result.matched || result.host || result.url || `https://${domain}`,
          templateId: result['template-id'] || result.templateID || result.template,
          tags: result.info?.tags || result.tags || [],
          reference: result.info?.reference || result.reference || [],
        });

        processed++;
        if (processed % 10 === 0) {
          const progress = Math.min(90, 51 + Math.floor((processed / Math.max(lines.length, 1)) * 40));
          await updateProgress(scanId, progress, `Nuclei: ${processed} findings so far...`);
        }
      } catch {
        // Skip unparseable lines
      }
    }

    console.log(`[NUCLEI-FULL] Parsed ${findings.length} findings`);

    if (findings.length === 0) {
      findings.push({
        type: 'nuclei-clean',
        title: 'No vulnerabilities found (full scan)',
        severity: 'info',
        description: `Full Nuclei scan completed. Exit code: ${code}. Output lines: ${lines.length}. Stderr: ${(stderr || '').slice(-300)}`,
        url: `https://${domain}`,
      });
    }

  } catch (err) {
    console.error('[NUCLEI-FULL] Error:', err.message);
    // Cleanup
    try { if (fs.existsSync(outputFile)) fs.unlinkSync(outputFile); } catch {}

    if (err.message.includes('not found') || err.message.includes('ENOENT')) {
      findings.push({ type: 'nuclei-skipped', title: 'Full Nuclei scan skipped', severity: 'info', description: 'Nuclei is not installed.', url: `https://${domain}` });
    } else {
      findings.push({ type: 'nuclei-error', title: 'Full Nuclei scan error', severity: 'info', description: `Error: ${err.message}`, url: `https://${domain}` });
    }
  }

  return findings;
}

module.exports = { runNucleiFull };
