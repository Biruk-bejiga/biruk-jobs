import { useEffect, useMemo, useState } from 'react';
import logo from '../assets/image/logo.png';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { FiBookmark, FiBriefcase, FiHome, FiLogOut, FiMenu, FiMoon, FiSun, FiUser } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/employee', icon: FiHome, label: 'Dashboard', end: true },
  { to: '/employee/jobs', icon: FiBriefcase, label: 'Browse Jobs' },
  { to: '/employee/applications', icon: FiUser, label: 'Applications' },
  { to: '/employee/favorites', icon: FiBookmark, label: 'Saved Jobs' },
  { to: '/employee/profile', icon: FiUser, label: 'Profile' },
];

const THEME_STORAGE_KEY = 'employee-dashboard-theme';

const EmployeeLayout = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') {
      return 'light';
    }
    return window.localStorage.getItem(THEME_STORAGE_KEY) ?? 'light';
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    }
  }, [theme]);

  const isDark = theme === 'dark';

  const activeLabel = useMemo(() => {
    const match = navItems.find((item) =>
      item.end ? location.pathname === item.to : location.pathname.startsWith(item.to),
    );
    return match?.label ?? '';
  }, [location.pathname]);

  const handleSignOut = async () => {
    await logout();
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const toggleSidebarState = () => {
    const isDesktop = typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches;
    if (isDesktop) {
      setIsCollapsed((prev) => !prev);
    } else {
      setSidebarOpen((prev) => !prev);
    }
  };

  return (
    <div className={isDark ? 'dark' : ''}>
      <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
        <div className="flex min-h-screen">
        <aside
          className={`fixed inset-y-0 left-0 z-30 w-72 transform shadow-xl transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 lg:border-r ${
            isCollapsed ? 'lg:w-24' : 'lg:w-72'
          } ${
            isDark ? 'bg-slate-900 text-slate-100 lg:border-slate-800' : 'bg-white text-slate-900 lg:border-slate-200'
          } ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
          <div className={`flex items-center justify-between gap-4 border-b px-6 py-4 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
            <button
              type="button"
              onClick={toggleSidebarState}
              aria-label="Toggle navigation"
              className={`inline-flex items-center justify-center rounded-full border p-2 transition ${
                isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <FiMenu className="text-xl" />
            </button>
            <NavLink className="flex flex-1 items-center gap-2" to="/">
              <img className="h-9 w-auto" src={logo} alt="React Jobs" />
              <span
                className={`hidden text-xl font-semibold tracking-tight md:block ${isCollapsed ? 'lg:hidden' : ''} ${
                  isDark ? 'text-slate-100' : 'text-slate-900'
                }`}
              >
                Dev Jobs
              </span>
            </NavLink>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className={`rounded-lg border px-2 py-1 text-sm lg:hidden ${
                isDark ? 'border-slate-700 text-slate-300' : 'border-slate-200 text-slate-500'
              }`}
            >
              Close
            </button>
          </div>
          <nav className={`flex flex-col gap-1 px-4 py-6 ${isCollapsed ? 'lg:px-2' : ''}`}>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    [
                      'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition',
                      isCollapsed ? 'lg:flex-col lg:items-center lg:gap-2 lg:px-2 lg:py-4 lg:text-xs' : '',
                      isActive
                        ? isDark
                          ? 'bg-indigo-500/20 text-indigo-200'
                          : 'bg-indigo-100 text-indigo-600'
                        : isDark
                        ? 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        : 'text-slate-600 hover:bg-indigo-50',
                    ]
                      .filter(Boolean)
                      .join(' ')
                  }
                >
                  <Icon className="text-xl" />
                  <span className={isCollapsed ? 'lg:hidden' : ''}>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
          <div
            className={`border-t px-6 py-4 text-sm ${
              isDark ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'
            } ${isCollapsed ? 'lg:hidden' : ''}`}
          >
            <p className={isDark ? 'font-semibold text-slate-100' : 'font-semibold text-slate-800'}>{user?.fullName}</p>
            <p>{user?.email}</p>
          </div>
        </aside>

        {sidebarOpen ? (
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-20 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          >
            <span className="sr-only">Close navigation</span>
          </button>
        ) : null}

        <div className="flex min-h-screen flex-1 flex-col">
          <header
            className={`flex items-center justify-between px-6 py-4 ${
              isDark
                ? 'border-b border-slate-800 bg-slate-900 text-slate-100'
                : 'border-b border-indigo-600 bg-indigo-700 text-white'
            }`}
          >
            <div>
              <p className={isDark ? 'text-sm text-slate-400' : 'text-sm text-indigo-200'}>Talent Workspace</p>
              <h1 className={isDark ? 'text-lg font-semibold text-slate-100' : 'text-lg font-semibold text-white'}>
                {activeLabel || 'Dashboard'}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSidebarOpen((prev) => !prev)}
                className={`inline-flex items-center gap-2 rounded-xl border border-transparent px-3 py-2 text-sm font-medium transition lg:hidden ${
                  isDark ? 'text-slate-100' : 'text-white'
                }`}
              >
                <FiMenu className="text-lg" />
                Menu
              </button>
              <button
                type="button"
                onClick={toggleTheme}
                className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                  isDark
                    ? 'border-slate-700 bg-slate-800 text-slate-100 hover:bg-slate-700'
                    : 'border-white/20 bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {isDark ? <FiSun className="text-lg" /> : <FiMoon className="text-lg" />}
                <span className="hidden sm:inline">{isDark ? 'Light mode' : 'Dark mode'}</span>
              </button>
              <button
                type="button"
                onClick={handleSignOut}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
              >
                <FiLogOut />
                Sign out
              </button>
            </div>
          </header>
          <main className={`${isDark ? 'flex-1 bg-slate-950' : 'flex-1 bg-slate-50'} px-0 py-0 sm:px-0 lg:px-0`}>
            <Outlet />
          </main>
        </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeLayout;
