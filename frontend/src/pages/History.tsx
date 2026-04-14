import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useScans } from '../hooks/useScans';

export default function History() {
  const { t } = useTranslation();
  const { scans, loading } = useScans();

  const statusStyles: Record<string, string> = {
    completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    running: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    failed: 'bg-red-500/10 text-red-400 border-red-500/20',
    queued: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    cancelled: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  };

  const statusLabels: Record<string, string> = {
    completed: t('scans.scanComplete'),
    running: t('scans.scanInProgress'),
    failed: t('scans.scanFailed'),
    queued: 'Queued',
    cancelled: 'Cancelled',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">{t('history.title')}</h1>
      </div>

      {scans.length === 0 ? (
        <div className="rounded-xl bg-gray-900 border border-gray-800 p-6">
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-gray-500 text-sm">{t('history.noHistory')}</p>
          </div>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block rounded-xl bg-gray-900 border border-gray-800 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-4">{t('history.date')}</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-4">{t('common.domains')}</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-4">{t('history.type')}</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-4">{t('history.status')}</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-4">{t('history.findings')}</th>
                  <th className="px-6 py-4" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/40">
                {scans.map((scan) => {
                  const totalFindings = scan.critical_count + scan.high_count + scan.medium_count + scan.low_count + scan.info_count;
                  return (
                    <tr key={scan.id} className="hover:bg-gray-800/20 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-300 whitespace-nowrap">
                        {new Date(scan.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-white whitespace-nowrap">
                        {scan.domains?.domain || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm whitespace-nowrap">
                        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                          scan.scan_type === 'quick'
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'bg-cyan-500/10 text-cyan-400'
                        }`}>
                          {scan.scan_type === 'quick' ? t('scans.startQuickScan') : t('scans.startFullScan')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm whitespace-nowrap">
                        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium border ${statusStyles[scan.status] || statusStyles.queued}`}>
                          {statusLabels[scan.status] || scan.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm whitespace-nowrap">
                        {scan.status === 'completed' ? (
                          <span className="text-gray-300">
                            {scan.critical_count > 0 && <span className="text-red-400 font-medium">{scan.critical_count}C </span>}
                            {scan.high_count > 0 && <span className="text-orange-400 font-medium">{scan.high_count}H </span>}
                            {scan.medium_count > 0 && <span className="text-yellow-400">{scan.medium_count}M </span>}
                            {scan.low_count > 0 && <span className="text-blue-400">{scan.low_count}L </span>}
                            <span className="text-gray-500">({totalFindings})</span>
                          </span>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <Link
                          to={`/scan/${scan.id}`}
                          className="text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
                        >
                          {t('history.viewResults')}
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-4">
            {scans.map((scan) => {
              const totalFindings = scan.critical_count + scan.high_count + scan.medium_count + scan.low_count + scan.info_count;
              return (
                <div key={scan.id} className="rounded-xl bg-gray-900 border border-gray-800 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-base font-semibold text-white">{scan.domains?.domain || '-'}</span>
                    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium border ${statusStyles[scan.status] || statusStyles.queued}`}>
                      {statusLabels[scan.status] || scan.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-sm mb-4">
                    <div>
                      <div className="text-gray-500 text-xs mb-1">{t('history.date')}</div>
                      <div className="text-gray-300">{new Date(scan.created_at).toLocaleDateString()}</div>
                    </div>
                    <div>
                      <div className="text-gray-500 text-xs mb-1">{t('history.type')}</div>
                      <div className="text-gray-300">
                        {scan.scan_type === 'quick' ? t('scans.startQuickScan') : t('scans.startFullScan')}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500 text-xs mb-1">{t('history.findings')}</div>
                      <div className="text-gray-300">{scan.status === 'completed' ? totalFindings : '-'}</div>
                    </div>
                  </div>
                  <Link
                    to={`/scan/${scan.id}`}
                    className="block w-full py-2 text-center text-sm font-medium text-emerald-400 hover:text-emerald-300 rounded-lg border border-gray-700 hover:border-emerald-500/30 transition-colors"
                  >
                    {t('history.viewResults')}
                  </Link>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
