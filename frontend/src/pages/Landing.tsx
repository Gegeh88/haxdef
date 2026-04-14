import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export default function Landing() {
  const { t } = useTranslation();

  const features = [
    {
      title: t('landing.feature1Title'),
      desc: t('landing.feature1Desc'),
      icon: (
        <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
        </svg>
      ),
    },
    {
      title: t('landing.feature2Title'),
      desc: t('landing.feature2Desc'),
      icon: (
        <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
      ),
    },
    {
      title: t('landing.feature3Title'),
      desc: t('landing.feature3Desc'),
      icon: (
        <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Nav */}
      <nav className="border-b border-gray-800/60 bg-gray-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold tracking-tight">
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-lg">
              &#x1f6e1;
            </span>
            <span>{t('common.appName')}</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              {t('common.login')}
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 text-sm font-medium rounded-lg bg-emerald-600 hover:bg-emerald-500 transition-colors"
            >
              {t('common.register')}
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Gradient background effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/20 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-6 pt-24 pb-20 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-8">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Cybersecurity Platform
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight mb-6">
            {t('landing.hero')}
          </h1>

          <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            {t('landing.subtitle')}
          </p>

          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-8 py-3.5 text-base font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30"
          >
            {t('landing.cta')}
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 pb-28">
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="group rounded-2xl bg-gray-900/60 border border-gray-800/60 p-8 hover:border-emerald-500/30 transition-all hover:bg-gray-900"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-5 group-hover:bg-emerald-500/15 transition-colors">
                {f.icon}
              </div>
              <h3 className="text-lg font-semibold mb-3">{f.title}</h3>
              <p className="text-gray-400 leading-relaxed text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800/60 py-8">
        <div className="max-w-6xl mx-auto px-6 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} {t('common.appName')}. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
