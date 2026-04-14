const { supabase } = require('./supabase');

async function updateProgress(scanId, progress, currentStep, extraFields = {}) {
  const updates = {
    progress,
    current_step: currentStep,
    ...extraFields,
  };

  const { error } = await supabase
    .from('scans')
    .update(updates)
    .eq('id', scanId);

  if (error) {
    console.error(`Failed to update progress for scan ${scanId}:`, error.message);
  }
}

async function completeScan(scanId, results) {
  const { critical, high, medium, low, info } = countSeverities(results);

  const { error } = await supabase
    .from('scans')
    .update({
      status: 'completed',
      progress: 100,
      current_step: 'Done',
      results_summary: {
        total: results.length,
        critical,
        high,
        medium,
        low,
        info,
      },
      results_detail: { findings: results },
      critical_count: critical,
      high_count: high,
      medium_count: medium,
      low_count: low,
      info_count: info,
      completed_at: new Date().toISOString(),
    })
    .eq('id', scanId);

  if (error) {
    console.error(`Failed to complete scan ${scanId}:`, error.message);
  }
}

async function failScan(scanId, errorMessage) {
  const { error } = await supabase
    .from('scans')
    .update({
      status: 'failed',
      current_step: 'Error',
      error_message: errorMessage,
      completed_at: new Date().toISOString(),
    })
    .eq('id', scanId);

  if (error) {
    console.error(`Failed to mark scan ${scanId} as failed:`, error.message);
  }
}

function countSeverities(findings) {
  const counts = { critical: 0, high: 0, medium: 0, low: 0, info: 0 };
  for (const finding of findings) {
    const sev = (finding.severity || 'info').toLowerCase();
    if (counts[sev] !== undefined) {
      counts[sev]++;
    }
  }
  return counts;
}

module.exports = { updateProgress, completeScan, failScan };
