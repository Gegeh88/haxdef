const { runCommand } = require('../../lib/process-runner');
const { updateProgress } = require('../../lib/progress');

async function runNucleiFull(scanId, domain) {
  const findings = [];

  try {
    // Check nuclei version and template count
    const { stdout: versionOut, stderr: versionErr, code: checkCode } = await runCommand('nuclei', ['-version'], { timeout: 10000 });
    console.log('[NUCLEI-FULL] Version:', (versionOut + versionErr).trim());
    if (checkCode !== 0) throw new Error('nuclei not found');

    // Check templates exist
    const { stdout: templateList, stderr: templateErr } = await runCommand('nuclei', ['-tl'], { timeout: 30000 });
    const templateCount = (templateList || '').split('\n').filter(l => l.trim()).length;
    console.log(`[NUCLEI-FULL] Templates available: ${templateCount}`);
    if (templateErr) console.log('[NUCLEI-FULL] Template list stderr:', templateErr.slice(0, 500));

    if (templateCount === 0) {
      // Try updating templates
      console.log('[NUCLEI-FULL] No templates found, updating...');
      const { stderr: updateErr } = await runCommand('nuclei', ['-update-templates'], { timeout: 120000 });
      console.log('[NUCLEI-FULL] Template update:', updateErr?.slice(0, 500));
    }

    await updateProgress(scanId, 52, 'Running full Nuclei scan (this takes 15-40 minutes)...');

    // Run full nuclei scan - removed -silent to see what's happening
    const { stdout, stderr, code } = await runCommand('nuclei', [
      '-u', `https://${domain}`,
      '-severity', 'info,low,medium,high,critical',
      '-type', 'http',
      '-jsonl',
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
    console.log(`[NUCLEI-FULL] Stdout length: ${stdout?.length || 0}`);
    console.log(`[NUCLEI-FULL] Stderr (first 1000 chars): ${stderr?.slice(0, 1000)}`);

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

        processed++;
        if (processed % 10 === 0) {
          const progress = Math.min(90, 51 + Math.floor((processed / Math.max(lines.length, 1)) * 40));
          await updateProgress(scanId, progress, `Nuclei: ${processed} findings so far...`);
        }
      } catch {
        // Skip unparseable lines
      }
    }

    console.log(`[NUCLEI-FULL] Parsed ${findings.length} findings from ${lines.length} output lines`);

    if (findings.length === 0) {
      findings.push({
        type: 'nuclei-clean',
        title: 'No vulnerabilities found (full scan)',
        severity: 'info',
        description: `Full Nuclei scan completed. Templates scanned: ${templateCount}. Exit code: ${code}. Stderr hint: ${(stderr || '').slice(0, 200)}`,
        url: `https://${domain}`,
      });
    }

  } catch (err) {
    console.error('[NUCLEI-FULL] Error:', err.message);
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
