import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-8xl sm:text-9xl font-bold text-emerald-500/20 leading-none mb-4 select-none">
          404
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3">
          Page not found
        </h1>
        <p className="text-gray-400 mb-8 max-w-md mx-auto">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          {t('common.back')}
        </Link>
      </div>
    </div>
  );
}
