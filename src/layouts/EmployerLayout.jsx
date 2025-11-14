import { useMemo, useState } from 'react';
import logo from '../assets/image/logo.png';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { FiBriefcase, FiClipboard, FiHome, FiLogOut, FiMenu, FiSettings, FiUsers } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/employer', icon: FiHome, label: 'Overview', end: true },
  { to: '/employer/jobs', icon: FiBriefcase, label: 'Jobs' },
  { to: '/employer/applications', icon: FiClipboard, label: 'Applications' },
  { to: '/employer/team', icon: FiUsers, label: 'Team' },
  { to: '/employer/profile', icon: FiSettings, label: 'Profile' },
];

const EmployerLayout = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const activeLabel = useMemo(() => {
    const match = navItems.find((item) =>
      item.end ? location.pathname === item.to : location.pathname.startsWith(item.to),
    );
    return match?.label ?? '';
  }, [location.pathname]);

  const handleSignOut = async () => {
    await logout();
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
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        <aside
          className={`fixed inset-y-0 left-0 z-30 w-72 transform bg-white shadow-xl transition-transform duration-200 ease-in-out lg:border-r lg:border-slate-200 lg:static lg:translate-x-0 ${
            isCollapsed ? 'lg:w-24' : 'lg:w-72'
          } ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-6 py-4">
            <button
              type="button"
              onClick={toggleSidebarState}
              aria-label="Toggle navigation"
              className="inline-flex items-center justify-center rounded-full border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100"
            >
              <FiMenu className="text-xl" />
            </button>
            <NavLink className="flex flex-1 items-center gap-2" to="/">
              <img className="h-9 w-auto" src={logo} alt="React Jobs" />
              <span className={`hidden text-xl font-semibold tracking-tight text-slate-900 md:block ${isCollapsed ? 'lg:hidden' : ''}`}>
                Dev Jobs
              </span>
            </NavLink>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="rounded-lg border border-slate-200 px-2 py-1 text-sm text-slate-500 lg:hidden"
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
                    `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition hover:bg-indigo-50 ${
                      isActive ? 'bg-indigo-100 text-indigo-600' : 'text-slate-600'
                    } ${
                      isCollapsed ? 'lg:flex-col lg:items-center lg:gap-2 lg:px-2 lg:py-4 lg:text-xs' : ''
                    }`
                  }
                >
                  <Icon className="text-xl" />
                  <span className={isCollapsed ? 'lg:hidden' : ''}>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
          <div className={`border-t border-slate-200 px-6 py-4 text-sm text-slate-500 ${isCollapsed ? 'lg:hidden' : ''}`}>
            <p className="font-semibold text-slate-800">{user?.fullName}</p>
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
          <header className="flex items-center justify-between border-b border-indigo-600 bg-indigo-700 px-6 py-4 text-white">
            <div>
              <p className="text-sm text-indigo-200">Employer Console</p>
              <h1 className="text-lg font-semibold text-white">{activeLabel || 'Overview'}</h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSidebarOpen((prev) => !prev)}
                className="inline-flex items-center gap-2 rounded-xl border border-transparent px-3 py-2 text-sm font-medium text-white transition lg:hidden"
              >
                <FiMenu className="text-lg" />
                Menu
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
          <main className="flex-1 bg-slate-50 px-0 py-0 sm:px-0 lg:px-0">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default EmployerLayout;
