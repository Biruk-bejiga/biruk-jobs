import { useMemo, useState } from 'react';
import logo from '../assets/image/logo.png';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { FiBookmark, FiBriefcase, FiHome, FiLogOut, FiUser } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/employee', icon: FiHome, label: 'Dashboard', end: true },
  { to: '/employee/jobs', icon: FiBriefcase, label: 'Browse Jobs' },
  { to: '/employee/applications', icon: FiUser, label: 'Applications' },
  { to: '/employee/favorites', icon: FiBookmark, label: 'Saved Jobs' },
  { to: '/employee/profile', icon: FiUser, label: 'Profile' },
];

const EmployeeLayout = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const activeLabel = useMemo(() => {
    const match = navItems.find((item) =>
      item.end ? location.pathname === item.to : location.pathname.startsWith(item.to),
    );
    return match?.label ?? '';
  }, [location.pathname]);

  const handleSignOut = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        <aside
          className={`fixed inset-y-0 left-0 z-30 w-72 transform bg-white shadow-xl transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
            <NavLink className="flex flex-shrink-0 items-center mr-4" to="/">
                          <img
                            className="h-10 w-auto"
                            src={logo}
                            alt="React Jobs"
                          />
                          <span className="hidden md:block text-white text-2xl font-bold ml-2"
                            >dev Jobs</span>
                        </NavLink>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="rounded-lg border border-slate-200 px-2 py-1 text-sm text-slate-500 lg:hidden"
            >
              Close
            </button>
          </div>
          <nav className="space-y-1 px-4 py-6">
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
                    }`
                  }
                >
                  <Icon className="text-lg" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
          <div className="border-t border-slate-200 px-6 py-4 text-sm text-slate-500">
            <p className="font-semibold text-slate-700">{user?.fullName}</p>
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
              <p className="text-sm text-indigo-200">Talent Workspace</p>
              <h1 className="text-lg font-semibold text-white">{activeLabel || 'Dashboard'}</h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSidebarOpen((prev) => !prev)}
                className="inline-flex items-center gap-2 rounded-xl border border-transparent px-3 py-2 text-sm font-medium text-white transition lg:hidden"
              >
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

export default EmployeeLayout;
