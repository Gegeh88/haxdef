import { useTranslation } from 'react-i18next';

export default function History() {
  const { t } = useTranslation();

  const statusStyles: Record<string, string> = {
    completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    running: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    failed: 'bg-red-500/10 text-red-400 border-red-500/20',
    queued: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  };

  const statusLabels: Record<string, string> = {
    completed: t('scans.scanComplete'),
    running: t('scans.scanInProgress'),
    failed: t('scans.scanFailed'),
    queued: t('common.loading'),
  };

  // Will be populated from Supabase later
  const scans: never[] = [];

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
        <div className="rounded-xl bg-gray-900 border border-gray-800 overflow-hidden">
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
              {/* Rows will be populated from Supabase */}
            </tbody>
          </table>
        </div>
      )}

      {/* Keep for reference: statusStyles and statusLabels are ready for use */}
      <span className="hidden">{JSON.stringify({ statusStyles, statusLabels })}</span>
    </div>
  );
}
