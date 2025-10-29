import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import {
  FiGrid,
  FiUsers,
  FiBriefcase,
  FiShield,
  FiBarChart2,
  FiSettings,
} from 'react-icons/fi';

const navItems = [
  {
    label: 'Dashboard',
    to: '/admin',
    icon: <FiGrid className="text-xl" aria-hidden="true" />,
  },
  {
    label: 'User Management',
    to: '/admin/users',
    icon: <FiUsers className="text-xl" aria-hidden="true" />,
  },
  {
    label: 'Job Management',
    to: '/admin/jobs',
    icon: <FiBriefcase className="text-xl" aria-hidden="true" />,
  },
  {
    label: 'Dispute Center',
    to: '/admin/disputes',
    icon: <FiShield className="text-xl" aria-hidden="true" />,
  },
  {
    label: 'Reports & Analytics',
    to: '/admin/reports',
    icon: <FiBarChart2 className="text-xl" aria-hidden="true" />,
  },
  {
    label: 'Profile Settings',
    to: '/admin/profile',
    icon: <FiSettings className="text-xl" aria-hidden="true" />,
  },
];

const AdminSidebar = ({ isOpen, onNavigate }) => {
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 w-72 transform bg-white/95 backdrop-blur border-r border-slate-200 transition-transform duration-200 ease-in-out dark:bg-slate-900/90 dark:border-slate-800 lg:static lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}
    >
      <div className="flex h-full flex-col">
        <div className="px-6 pb-6 pt-8">
          <div className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
            FlexiSphere Admin
          </div>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Manage talent, jobs, and platform performance at a glance.
          </p>
        </div>
        <nav className="flex-1 space-y-1 px-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={({ isActive }) =>
                `group flex items-center rounded-lg px-4 py-3 text-sm font-medium transition-colors duration-150 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200/60 dark:shadow-indigo-900/40'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
                }`
              }
            >
              <span className="mr-3 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 transition-colors duration-150 group-hover:bg-indigo-100 group-hover:text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300 dark:group-hover:bg-indigo-500/20">
                {item.icon}
              </span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="px-6 pb-10 pt-6 text-xs text-slate-400 dark:text-slate-500">
          © {new Date().getFullYear()} FlexiSphere Platform
        </div>
      </div>
    </aside>
  );
};

AdminSidebar.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onNavigate: PropTypes.func,
};

AdminSidebar.defaultProps = {
  onNavigate: () => {},
};

export default AdminSidebar;
