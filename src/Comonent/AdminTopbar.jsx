import PropTypes from 'prop-types';
import { FiMenu, FiBell, FiMoon, FiSun } from 'react-icons/fi';

const AdminTopbar = ({ onToggleSidebar, onToggleTheme, isDarkMode, user }) => {
  const displayName = user?.fullName ?? 'Alex Bennett';
  const initials = (displayName || 'A')
    .split(' ')
    .filter(Boolean)
    .map((s) => s[0]?.toUpperCase())
    .slice(0, 2)
    .join('');

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/80 px-4 py-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80 lg:px-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-indigo-200 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-indigo-500/40"
          aria-label="Toggle sidebar navigation"
        >
          <FiMenu className="text-xl" />
        </button>
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">FlexiSphere Admin Console</p>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Operational Overview</h1>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleTheme}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-indigo-200 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-indigo-500/40"
          aria-label={isDarkMode ? 'Activate light mode' : 'Activate dark mode'}
        >
          {isDarkMode ? <FiSun className="text-lg" /> : <FiMoon className="text-lg" />}
        </button>

        <button
          type="button"
          className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-indigo-200 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-indigo-500/40"
          aria-label="Notifications"
        >
          <FiBell className="text-lg" />
          <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-semibold text-white">
            3
          </span>
        </button>

        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-500 text-sm font-semibold text-white">
            {initials}
          </div>
          <div className="hidden text-left text-sm leading-tight sm:block">
            <p className="font-semibold text-slate-900 dark:text-white">{displayName}</p>
            <p className="text-slate-500 dark:text-slate-400">{user?.role ? `${user.role.charAt(0).toUpperCase() + user.role.slice(1)} Admin` : 'Platform Admin'}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

AdminTopbar.propTypes = {
  onToggleSidebar: PropTypes.func.isRequired,
  onToggleTheme: PropTypes.func.isRequired,
  isDarkMode: PropTypes.bool.isRequired,
};

export default AdminTopbar;
