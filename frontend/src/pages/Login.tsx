import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
      navigate('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
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
          <h1 className="text-2xl font-bold text-white mb-1">{t('auth.loginTitle')}</h1>
          <p className="text-gray-400 text-sm mb-8">{t('auth.loginSubtitle')}</p>

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
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                  {t('auth.password')}
                </label>
                <button type="button" className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors">
                  {t('auth.forgotPassword')}
                </button>
              </div>
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
              {loading ? t('common.loading') : t('auth.loginButton')}
            </button>
          </form>
        </div>

        {/* Footer link */}
        <p className="text-center text-sm text-gray-400 mt-6">
          {t('auth.noAccount')}{' '}
          <Link to="/register" className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
            {t('common.register')}
          </Link>
        </p>
      </div>
    </div>
  );
}
