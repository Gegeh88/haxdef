import { useEffect, useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { Header } from './Header';
import { Footer } from './Footer';

const navItems = [
  { key: 'nav.dashboard', path: '/dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1' },
  { key: 'nav.domains', path: '/domains', icon: 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9' },
  { key: 'nav.history', path: '/history', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
];

export function DashboardLayout() {
  const { t } = useTranslation();
  const { user, loading, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login', { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <Header isAuthenticated={true} onLogout={signOut} />

      <div className="flex flex-1">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`
            fixed lg:static inset-y-0 left-0 z-40
            w-64 bg-gray-900 border-r border-gray-800
            transform transition-transform duration-200 ease-in-out
            lg:transform-none lg:translate-x-0
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            pt-16 lg:pt-0
          `}
        >
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors
                    ${isActive
                      ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-800'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800 border border-transparent'
                    }
                  `}
                >
                  <svg
                    className="h-5 w-5 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                  </svg>
                  {t(item.key)}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Mobile sidebar toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden fixed bottom-4 left-4 z-50 bg-emerald-600 hover:bg-emerald-700 text-white p-3 rounded-full shadow-lg transition-colors"
          aria-label="Toggle sidebar"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Main content */}
        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>

      <Footer />
    </div>
  );
}
