const { runCommand } = require('../../lib/process-runner');
const { updateProgress } = require('../../lib/progress');
const { detectProtocols } = require('../../lib/detect-protocol');
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

    // Detect which protocols work (avoid wasting time on dead HTTPS)
    const urls = await detectProtocols(domain);
    const targetFile = path.join(os.tmpdir(), `nuclei-targets-${scanId}.txt`);
    fs.writeFileSync(targetFile, urls.join('\n') + '\n');
    console.log(`[NUCLEI-FULL] Targets: ${urls.join(', ')}`);

    const { stdout, stderr, code } = await runCommand('nuclei', [
      '-l', targetFile,
      '-t', templateDir,
      '-severity', 'info,low,medium,high,critical',
      '-type', 'http',
      '-je', outputFile,
      '-duc',
      '-timeout', '30',
      '-retries', '3',
      '-rate-limit', '150',
      '-bulk-size', '25',
      '-concurrency', '25',
      '-no-color',
      '-stats',
      '-stats-interval', '60',
    ], { timeout: 2400000 }); // 40 min timeout

    try { fs.unlinkSync(targetFile); } catch {}

    console.log(`[NUCLEI-FULL] Exit code: ${code}`);
    console.log(`[NUCLEI-FULL] Stdout (last 500): ${(stdout || '').slice(-500)}`);
    console.log(`[NUCLEI-FULL] Stderr (last 1000): ${(stderr || '').slice(-1000)}`);

    // Read results from file — -je writes a JSON array, not JSON Lines
    let results = [];
    if (fs.existsSync(outputFile)) {
      const content = fs.readFileSync(outputFile, 'utf8').trim();
      console.log(`[NUCLEI-FULL] Output file size: ${content.length} bytes, starts with: ${content.slice(0, 50)}`);
      try {
        const parsed = JSON.parse(content);
        results = Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        // Fallback: try JSON Lines
        results = content.split('\n').filter(l => l.trim()).map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
      }
      console.log(`[NUCLEI-FULL] Parsed ${results.length} results from file`);
      fs.unlinkSync(outputFile);
    } else {
      console.log('[NUCLEI-FULL] No output file created.');
    }

    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      if (!result || typeof result !== 'object') continue;

      if (i === 0) {
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

      if ((i + 1) % 10 === 0) {
        const progress = Math.min(90, 51 + Math.floor(((i + 1) / results.length) * 40));
        await updateProgress(scanId, progress, `Nuclei: ${i + 1} findings so far...`);
      }
    }

    console.log(`[NUCLEI-FULL] Total Nuclei findings: ${findings.length}`);

    if (findings.length === 0) {
      findings.push({
        type: 'nuclei-clean',
        title: 'No vulnerabilities found (full scan)',
        severity: 'info',
        description: `Full Nuclei scan completed. Exit code: ${code}. Results: ${results.length}. Stderr: ${(stderr || '').slice(-300)}`,
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
