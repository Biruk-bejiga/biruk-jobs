import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../Comonent/AdminSidebar';
import AdminTopbar from '../Comonent/AdminTopbar';
import { useAuth } from '../context/AuthContext';

const getPreferredTheme = () => {
  if (typeof window === 'undefined') {
    return false;
  }

  const persisted = window.localStorage.getItem('flexisphere-theme');
  if (persisted !== null) {
    return persisted === 'dark';
  }

  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
};

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(getPreferredTheme);

  useEffect(() => {
    if (typeof document === 'undefined' || typeof window === 'undefined') return undefined;

    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    window.localStorage.setItem('flexisphere-theme', isDarkMode ? 'dark' : 'light');

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemTheme = (event) => {
      if (!window.localStorage.getItem('flexisphere-theme')) {
        setIsDarkMode(event.matches);
      }
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleSystemTheme);
    } else {
      mediaQuery.addListener(handleSystemTheme);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleSystemTheme);
      } else {
        mediaQuery.removeListener(handleSystemTheme);
      }
    };
  }, [isDarkMode]);

  const handleToggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  const handleToggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-200 dark:bg-slate-950 dark:text-slate-100">
      <div className="flex min-h-screen">
        <AdminSidebar isOpen={isSidebarOpen} onNavigate={handleCloseSidebar} />

        {isSidebarOpen && (
          <button
            type="button"
            onClick={handleCloseSidebar}
            className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm lg:hidden"
            aria-label="Close sidebar overlay"
          />
        )}

        <div className="flex min-h-screen flex-1 flex-col">
          <AdminTopbar
            onToggleSidebar={handleToggleSidebar}
            onToggleTheme={handleToggleTheme}
            isDarkMode={isDarkMode}
            user={user}
          />
          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-10">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
