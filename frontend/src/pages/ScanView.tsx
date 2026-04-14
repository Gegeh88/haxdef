import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useScanProgress } from '../hooks/useScanProgress';
import type { Scan } from '../types/database';

interface Finding {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  title: string;
  description: string;
  remediation?: string;
  evidence?: string;
}

const severityConfig = {
  critical: {
    label: 'Critical',
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    text: 'text-red-400',
    badge: 'bg-red-500/20 text-red-400 border-red-500/30',
    dot: 'bg-red-500',
  },
  high: {
    label: 'High',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30',
    text: 'text-orange-400',
    badge: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    dot: 'bg-orange-500',
  },
  medium: {
    label: 'Medium',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
    text: 'text-yellow-400',
    badge: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    dot: 'bg-yellow-500',
  },
  low: {
    label: 'Low',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    text: 'text-blue-400',
    badge: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    dot: 'bg-blue-500',
  },
  info: {
    label: 'Info',
    bg: 'bg-gray-500/10',
    border: 'border-gray-500/30',
    text: 'text-gray-400',
    badge: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    dot: 'bg-gray-500',
  },
};

function SeverityBadge({ severity }: { severity: Finding['severity'] }) {
  const config = severityConfig[severity];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border ${config.badge}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}

function ScanTypeBadge({ scanType }: { scanType: Scan['scan_type'] }) {
  const isQuick = scanType === 'quick';
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full border ${
        isQuick
          ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30'
          : 'bg-purple-500/15 text-purple-400 border-purple-500/30'
      }`}
    >
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        {isQuick ? (
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        )}
      </svg>
      {isQuick ? 'Quick Scan' : 'Full Scan'}
    </span>
  );
}

function ProgressBar({ progress, currentStep }: { progress: number; currentStep: string | null }) {
  return (
    <div className="rounded-xl bg-gray-900 border border-gray-800 p-8">
      <div className="flex flex-col items-center">
        {/* Circular progress */}
        <div className="relative w-36 h-36 mb-6">
          <svg className="w-36 h-36 -rotate-90" viewBox="0 0 144 144">
            {/* Background circle */}
            <circle
              cx="72"
              cy="72"
              r="62"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-gray-800"
            />
            {/* Progress circle */}
            <circle
              cx="72"
              cy="72"
              r="62"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeLinecap="round"
              className="text-emerald-500 transition-all duration-500 ease-out"
              strokeDasharray={`${2 * Math.PI * 62}`}
              strokeDashoffset={`${2 * Math.PI * 62 * (1 - progress / 100)}`}
            />
          </svg>
          {/* Percentage text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-white">{Math.round(progress)}%</span>
            <span className="text-xs text-gray-500 mt-1">complete</span>
          </div>
        </div>

        {/* Linear progress bar */}
        <div className="w-full max-w-md mb-4">
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Current step */}
        {currentStep && (
          <div className="flex items-center gap-3 text-gray-300">
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
            </div>
            <span className="text-sm">{currentStep}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCards({ scan }: { scan: Scan }) {
  const cards = [
    { label: 'Critical', count: scan.critical_count, severity: 'critical' as const },
    { label: 'High', count: scan.high_count, severity: 'high' as const },
    { label: 'Medium', count: scan.medium_count, severity: 'medium' as const },
    { label: 'Low', count: scan.low_count, severity: 'low' as const },
    { label: 'Info', count: scan.info_count, severity: 'info' as const },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
      {cards.map((card) => {
        const config = severityConfig[card.severity];
        return (
          <div
            key={card.severity}
            className={`rounded-xl ${config.bg} border ${config.border} p-4 text-center`}
          >
            <div className={`text-2xl font-bold ${config.text} mb-1`}>{card.count}</div>
            <div className="text-xs text-gray-400 font-medium">{card.label}</div>
          </div>
        );
      })}
    </div>
  );
}

function FindingItem({ finding }: { finding: Finding }) {
  const [expanded, setExpanded] = useState(false);
  const config = severityConfig[finding.severity];

  return (
    <div className={`rounded-xl ${config.bg} border ${config.border} overflow-hidden`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between gap-4 p-4 text-left hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <SeverityBadge severity={finding.severity} />
          <span className="text-sm font-medium text-white truncate">{finding.title}</span>
        </div>
        <svg
          className={`w-4 h-4 text-gray-500 shrink-0 transition-transform duration-200 ${
            expanded ? 'rotate-180' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {expanded && (
        <div className="border-t border-gray-800 px-4 py-4 space-y-4">
          {/* Description */}
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Description
            </h4>
            <p className="text-sm text-gray-300 leading-relaxed">{finding.description}</p>
          </div>

          {/* Remediation */}
          {finding.remediation && (
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Remediation
              </h4>
              <p className="text-sm text-emerald-300/90 leading-relaxed">{finding.remediation}</p>
            </div>
          )}

          {/* Evidence */}
          {finding.evidence && (
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Evidence
              </h4>
              <pre className="text-xs text-gray-400 bg-gray-950 border border-gray-800 rounded-lg p-3 overflow-x-auto font-mono">
                {finding.evidence}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function EmptyFindings() {
  return (
    <div className="rounded-xl bg-gray-900 border border-gray-800 p-12 text-center">
      <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-white mb-1">No vulnerabilities found</h3>
      <p className="text-sm text-gray-500">Your domain passed all security checks. Great job!</p>
    </div>
  );
}

function parseFindings(scan: Scan): Finding[] {
  const detail = scan.results_detail;
  if (!detail) return [];

  // Support results_detail as an array of findings
  if (Array.isArray(detail)) {
    return detail.map((item: Record<string, unknown>, index: number) => ({
      id: (item.id as string) || String(index),
      severity: (item.severity as Finding['severity']) || 'info',
      title: (item.title as string) || 'Unknown finding',
      description: (item.description as string) || '',
      remediation: (item.remediation as string) || undefined,
      evidence: (item.evidence as string) || undefined,
    }));
  }

  // Support results_detail as an object with a "findings" key
  if (detail.findings && Array.isArray(detail.findings)) {
    return (detail.findings as Record<string, unknown>[]).map(
      (item: Record<string, unknown>, index: number) => ({
        id: (item.id as string) || String(index),
        severity: (item.severity as Finding['severity']) || 'info',
        title: (item.title as string) || 'Unknown finding',
        description: (item.description as string) || '',
        remediation: (item.remediation as string) || undefined,
        evidence: (item.evidence as string) || undefined,
      })
    );
  }

  return [];
}

export default function ScanView() {
  const { t } = useTranslation();
  const { scanId } = useParams<{ scanId: string }>();
  const { scan, loading, refetch } = useScanProgress(scanId ?? null);

  const isRunning = scan?.status === 'running' || scan?.status === 'queued';
  const isCompleted = scan?.status === 'completed';
  const isFailed = scan?.status === 'failed';

  const findings = scan ? parseFindings(scan) : [];
  const totalIssues = scan
    ? scan.critical_count + scan.high_count + scan.medium_count + scan.low_count + scan.info_count
    : 0;

  // --- Loading state ---
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative flex h-10 w-10">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-10 w-10 bg-emerald-500/20 border border-emerald-500/30 items-center justify-center">
              <svg className="w-5 h-5 text-emerald-400 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </span>
          </div>
          <p className="text-sm text-gray-400">{t('scans.loading', 'Loading scan data...')}</p>
        </div>
      </div>
    );
  }

  // --- Not found state ---
  if (!scan) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white mb-1">Scan not found</h3>
          <p className="text-sm text-gray-500 mb-6">
            This scan may have been deleted or the link is invalid.
          </p>
          <Link
            to="/history"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back to History
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            to="/history"
            className="w-9 h-9 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center text-gray-400 hover:text-white hover:border-gray-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-xl sm:text-2xl font-bold text-white">
                {(scan.results_summary as Record<string, unknown>)?.domain as string || `Scan ${scan.id.slice(0, 8)}`}
              </h1>
              <ScanTypeBadge scanType={scan.scan_type} />
            </div>
            <p className="text-sm text-gray-500">
              {scan.started_at
                ? `Started ${new Date(scan.started_at).toLocaleString()}`
                : `Created ${new Date(scan.created_at).toLocaleString()}`}
              {scan.completed_at && ` \u2022 Completed ${new Date(scan.completed_at).toLocaleString()}`}
            </p>
          </div>
        </div>

        {/* Download PDF button (placeholder) */}
        {isCompleted && (
          <button
            disabled
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-gray-800 text-gray-500 border border-gray-700 cursor-not-allowed opacity-60"
            title="PDF export coming soon"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Download PDF
          </button>
        )}
      </div>

      {/* Error state */}
      {isFailed && (
        <div className="rounded-xl bg-red-500/5 border border-red-500/20 p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-red-400 mb-1">Scan Failed</h3>
              <p className="text-sm text-gray-400 mb-4">
                {scan.error_message || 'An unexpected error occurred while running this scan.'}
              </p>
              <button
                onClick={() => refetch()}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
                </svg>
                Try again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Progress section (running / queued) */}
      {isRunning && <ProgressBar progress={scan.progress} currentStep={scan.current_step} />}

      {/* Results section (completed) */}
      {isCompleted && (
        <>
          {/* Summary cards */}
          <SummaryCards scan={scan} />

          {/* Findings list */}
          <div className="rounded-xl bg-gray-900 border border-gray-800 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-white">
                {t('scans.findings', 'Findings')}
              </h2>
              {totalIssues > 0 && (
                <span className="text-sm text-gray-500">
                  {totalIssues} {totalIssues === 1 ? 'issue' : 'issues'} found
                </span>
              )}
            </div>

            {findings.length > 0 ? (
              <div className="space-y-3">
                {findings.map((finding) => (
                  <FindingItem key={finding.id} finding={finding} />
                ))}
              </div>
            ) : totalIssues === 0 ? (
              <EmptyFindings />
            ) : (
              /* Counts exist but no detailed findings parsed -- show a simple summary */
              <div className="text-center py-8">
                <p className="text-sm text-gray-500">
                  Detailed findings will appear here once the report is generated.
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Status badge for queued state */}
      {scan.status === 'queued' && !scan.current_step && (
        <div className="rounded-xl bg-gray-900 border border-gray-800 p-8 text-center">
          <div className="relative flex h-10 w-10 mx-auto mb-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-10 w-10 bg-cyan-500/20 border border-cyan-500/30 items-center justify-center">
              <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
          </div>
          <h3 className="text-base font-semibold text-white mb-1">
            {t('scans.queued', 'Scan queued')}
          </h3>
          <p className="text-sm text-gray-500">
            Your scan is in the queue and will start shortly.
          </p>
        </div>
      )}

      {/* Cancelled state */}
      {scan.status === 'cancelled' && (
        <div className="rounded-xl bg-gray-900 border border-gray-800 p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-white mb-1">Scan Cancelled</h3>
          <p className="text-sm text-gray-500">This scan was cancelled before it could complete.</p>
        </div>
      )}
    </div>
  );
}
