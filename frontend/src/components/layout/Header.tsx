import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface HeaderProps {
  isAuthenticated: boolean;
  onLogout: () => void;
}

export function Header({ isAuthenticated, onLogout }: HeaderProps) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const currentLang = i18n.language?.startsWith('hu') ? 'HU' : 'EN';

  const toggleLanguage = () => {
    const newLang = currentLang === 'HU' ? 'en' : 'hu';
    i18n.changeLanguage(newLang);
  };

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">&#x1F6E1;</span>
            <span className="text-xl font-bold text-emerald-400 tracking-tight">
              HaxDef
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-gray-300 hover:text-emerald-400 transition-colors text-sm font-medium"
                >
                  {t('nav.dashboard')}
                </Link>
                <Link
                  to="/domains"
                  className="text-gray-300 hover:text-emerald-400 transition-colors text-sm font-medium"
                >
                  {t('nav.domains')}
                </Link>
                <Link
                  to="/history"
                  className="text-gray-300 hover:text-emerald-400 transition-colors text-sm font-medium"
                >
                  {t('nav.history')}
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-gray-400 hover:text-red-400 transition-colors text-sm font-medium"
                >
                  {t('nav.logout')}
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-300 hover:text-emerald-400 transition-colors text-sm font-medium"
                >
                  {t('nav.login')}
                </Link>
                <Link
                  to="/register"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  {t('nav.register')}
                </Link>
              </>
            )}

            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-md text-xs font-bold tracking-wider transition-colors border border-gray-700"
            >
              {currentLang}
            </button>
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-gray-400 hover:text-white p-2"
            aria-label="Toggle menu"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-800 py-4 space-y-3">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-gray-300 hover:text-emerald-400 transition-colors text-sm font-medium py-2"
                >
                  {t('nav.dashboard')}
                </Link>
                <Link
                  to="/domains"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-gray-300 hover:text-emerald-400 transition-colors text-sm font-medium py-2"
                >
                  {t('nav.domains')}
                </Link>
                <Link
                  to="/history"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-gray-300 hover:text-emerald-400 transition-colors text-sm font-medium py-2"
                >
                  {t('nav.history')}
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="block text-gray-400 hover:text-red-400 transition-colors text-sm font-medium py-2"
                >
                  {t('nav.logout')}
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-gray-300 hover:text-emerald-400 transition-colors text-sm font-medium py-2"
                >
                  {t('nav.login')}
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-gray-300 hover:text-emerald-400 transition-colors text-sm font-medium py-2"
                >
                  {t('nav.register')}
                </Link>
              </>
            )}
            <button
              onClick={toggleLanguage}
              className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-md text-xs font-bold tracking-wider transition-colors border border-gray-700"
            >
              {currentLang}
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
