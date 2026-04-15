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

    // Create a target list with both http and https
    const targetFile = path.join(os.tmpdir(), `nuclei-qtargets-${Date.now()}.txt`);
    fs.writeFileSync(targetFile, `https://${domain}\nhttp://${domain}\n`);

    const { stdout, stderr, code } = await runCommand('nuclei', [
      '-l', targetFile,
      '-t', templateDir,
      '-severity', 'critical,high,medium',
      '-type', 'http',
      '-je', outputFile,
      '-duc',
      '-timeout', '20',
      '-retries', '2',
      '-rate-limit', '100',
      '-bulk-size', '25',
      '-concurrency', '15',
      '-no-color',
      '-exclude-type', 'ssl',
    ], { timeout: 900000 }); // 15 min timeout

    try { fs.unlinkSync(targetFile); } catch {}

    console.log(`[NUCLEI-QUICK] Exit code: ${code}`);
    console.log(`[NUCLEI-QUICK] Stderr (last 500): ${(stderr || '').slice(-500)}`);

    // Read results from file — -je writes a JSON array, not JSON Lines
    let results = [];
    if (fs.existsSync(outputFile)) {
      const content = fs.readFileSync(outputFile, 'utf8').trim();
      console.log(`[NUCLEI-QUICK] Output file size: ${content.length} bytes, starts with: ${content.slice(0, 50)}`);
      try {
        const parsed = JSON.parse(content);
        results = Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        results = content.split('\n').filter(l => l.trim()).map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
      }
      console.log(`[NUCLEI-QUICK] Parsed ${results.length} results from file`);
      fs.unlinkSync(outputFile);
    } else {
      console.log('[NUCLEI-QUICK] No output file.');
    }

    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      if (!result || typeof result !== 'object') continue;

      if (i === 0) {
        console.log('[NUCLEI-QUICK] Sample keys:', Object.keys(result).join(', '));
        console.log('[NUCLEI-QUICK] Sample:', JSON.stringify(result).slice(0, 500));
      }
      findings.push({
        type: 'nuclei',
        title: result.info?.name || result['template-id'] || result.templateID || result.template || 'Nuclei finding',
        severity: (result.info?.severity || result.severity || 'info').toLowerCase(),
        description: result.info?.description || result.description || `Found by template: ${result['template-id'] || result.templateID || 'unknown'}`,
        remediation: result.info?.remediation || result.remediation || undefined,
        evidence: result['matched-at'] || result.matched || result.host || result.url || '',
        url: result['matched-at'] || result.matched || result.host || result.url || `https://${domain}`,
        templateId: result['template-id'] || result.templateID || result.template,
        tags: result.info?.tags || result.tags || [],
      });
    }

    console.log(`[NUCLEI-QUICK] Parsed ${findings.length} findings`);

    if (findings.length === 0) {
      findings.push({
        type: 'nuclei-clean',
        title: 'No critical vulnerabilities found (quick scan)',
        severity: 'info',
        description: `Nuclei quick scan completed. Exit code: ${code}. Results: ${results.length}. Stderr: ${(stderr || '').slice(-200)}`,
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
