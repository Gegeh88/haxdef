import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Dashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();

  const stats = [
    {
      label: t('dashboard.totalDomains'),
      value: '0',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3" />
        </svg>
      ),
      color: 'emerald' as const,
    },
    {
      label: t('dashboard.totalScans'),
      value: '0',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
      ),
      color: 'cyan' as const,
    },
    {
      label: t('dashboard.criticalIssues'),
      value: '0',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
      ),
      color: 'red' as const,
    },
  ];

  const colorMap = {
    emerald: {
      bg: 'bg-emerald-500/5',
      border: 'border-emerald-500/20',
      text: 'text-emerald-400',
      iconBg: 'bg-emerald-500/10',
    },
    cyan: {
      bg: 'bg-cyan-500/5',
      border: 'border-cyan-500/20',
      text: 'text-cyan-400',
      iconBg: 'bg-cyan-500/10',
    },
    red: {
      bg: 'bg-red-500/5',
      border: 'border-red-500/20',
      text: 'text-red-400',
      iconBg: 'bg-red-500/10',
    },
  };

  return (
    <div>
      {/* Welcome */}
      <div className="mb-10">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          {t('dashboard.welcome')}{user?.email ? `, ${user.email.split('@')[0]}` : ''}
        </h1>
        <p className="text-gray-400">{t('dashboard.overview')}</p>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-5 mb-10">
        {stats.map((stat) => {
          const colors = colorMap[stat.color];
          return (
            <div
              key={stat.label}
              className={`rounded-xl ${colors.bg} border ${colors.border} p-6`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-gray-400">{stat.label}</span>
                <div className={`w-9 h-9 rounded-lg ${colors.iconBg} ${colors.text} flex items-center justify-center`}>
                  {stat.icon}
                </div>
              </div>
              <div className={`text-3xl font-bold ${colors.text}`}>{stat.value}</div>
            </div>
          );
        })}
      </div>

      {/* Recent Scans */}
      <div className="rounded-xl bg-gray-900 border border-gray-800 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">{t('dashboard.recentScans')}</h2>
          <Link
            to="/domains"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            {t('dashboard.addDomain')}
          </Link>
        </div>

        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
          </div>
          <p className="text-gray-500 text-sm">{t('dashboard.noScans')}</p>
        </div>
      </div>
    </div>
  );
}
