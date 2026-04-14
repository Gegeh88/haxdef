import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Register() {
  const { t } = useTranslation();
  const { signUp } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError(t('auth.passwordMismatch'));
      return;
    }

    setLoading(true);

    try {
      await signUp(email, password);
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-2xl font-bold text-white">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xl">
              &#x1f6e1;
            </span>
            {t('common.appName')}
          </Link>
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-gray-900/70 border border-gray-800/60 p-8 backdrop-blur-sm">
          {success ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-5">
                <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white mb-3">{t('auth.registerTitle')}</h2>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                {t('auth.registrationSuccess')}
              </p>
              <Link
                to="/login"
                className="inline-flex px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-sm font-semibold text-white transition-colors"
              >
                {t('common.login')}
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-white mb-1">{t('auth.registerTitle')}</h1>
              <p className="text-gray-400 text-sm mb-8">{t('auth.registerSubtitle')}</p>

              {error && (
                <div className="mb-6 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1.5">
                    {t('auth.email')}
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg bg-gray-800/70 border border-gray-700/60 px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/40 transition-colors"
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1.5">
                    {t('auth.password')}
                  </label>
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg bg-gray-800/70 border border-gray-700/60 px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/40 transition-colors"
                    placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1.5">
                    {t('auth.confirmPassword')}
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-lg bg-gray-800/70 border border-gray-700/60 px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/40 transition-colors"
                    placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2.5 text-sm font-semibold text-white transition-colors flex items-center justify-center gap-2"
                >
                  {loading && (
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  )}
                  {loading ? t('common.loading') : t('auth.registerButton')}
                </button>
              </form>
            </>
          )}
        </div>

        {/* Footer link */}
        {!success && (
          <p className="text-center text-sm text-gray-400 mt-6">
            {t('auth.hasAccount')}{' '}
            <Link to="/login" className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
              {t('common.login')}
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
