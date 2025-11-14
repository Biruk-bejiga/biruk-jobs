import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import logo from '../assets/image/logo.png'
import { useAuth } from '../context/AuthContext'

const getDashboardPath = (role) => {
  if (role === 'admin') return '/admin'
  if (role === 'employer') return '/employer'
  if (role === 'employee') return '/employee'
  return '/'
}

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const linkClass = ({ isActive }) =>
    isActive
      ? 'rounded-md px-3 py-2 bg-black text-white transition hover:bg-gray-900'
      : 'rounded-md px-3 py-2 text-white transition hover:bg-gray-900 hover:text-white'

  const dashboardPath = getDashboardPath(user?.role)

  const handleSignOut = async () => {
    await logout()
  }

  const handleToggleMenu = () => {
    setIsMenuOpen((prev) => !prev)
  }

  const handleCloseMenu = () => {
    setIsMenuOpen(false)
  }

  const mobileLinkClass = ({ isActive }) => `${linkClass({ isActive })} block`

  return (
    <nav className="border-b border-indigo-500 bg-indigo-700">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <NavLink className="flex items-center gap-2" to="/">
            <img className="h-10 w-auto" src={logo} alt="Dev Jobs" />
            <span className="hidden text-2xl font-bold text-white md:block">Dev Jobs</span>
          </NavLink>

          <div className="flex items-center md:hidden">
            <button
              type="button"
              onClick={handleToggleMenu}
              aria-label="Toggle navigation menu"
              aria-expanded={isMenuOpen}
              className="inline-flex items-center justify-center rounded-md p-2 text-white transition hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            >
              <svg
                className="h-6 w-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {isMenuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M3 12h18M3 6h18M3 18h18" />
                )}
              </svg>
            </button>
          </div>

          <div className="hidden items-center gap-2 md:flex">
            <NavLink to="/" className={linkClass}>
              Home
            </NavLink>
            <NavLink to="/jobs" className={linkClass}>
              Jobs
            </NavLink>
            {user?.role === 'employer' ? (
              <NavLink to="/employer/jobs/new" className={linkClass}>
                Add Job
              </NavLink>
            ) : null}
            {isAuthenticated ? (
              <NavLink to={dashboardPath} className={linkClass}>
                Dashboard
              </NavLink>
            ) : null}
            {isAuthenticated ? (
              <button
                type="button"
                onClick={handleSignOut}
                className="rounded-md px-3 py-2 text-sm font-medium text-white transition hover:bg-gray-900"
              >
                Sign out
              </button>
            ) : (
              <>
                <NavLink to="/login" className={linkClass}>
                  Sign In
                </NavLink>
                <NavLink to="/register" className={linkClass}>
                  Sign up
                </NavLink>
              </>
            )}
          </div>
        </div>
      </div>

      <div className={`${isMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'} overflow-hidden transition-all duration-200 md:hidden`}>
        <div className="space-y-1 border-t border-indigo-600 bg-indigo-700 px-4 pb-4 pt-2">
          <NavLink to="/" onClick={handleCloseMenu} className={mobileLinkClass}>
            Home
          </NavLink>
          <NavLink to="/jobs" onClick={handleCloseMenu} className={mobileLinkClass}>
            Jobs
          </NavLink>
          {user?.role === 'employer' ? (
            <NavLink to="/employer/jobs/new" onClick={handleCloseMenu} className={mobileLinkClass}>
              Add Job
            </NavLink>
          ) : null}
          {isAuthenticated ? (
            <NavLink to={dashboardPath} onClick={handleCloseMenu} className={mobileLinkClass}>
              Dashboard
            </NavLink>
          ) : null}
          {isAuthenticated ? (
            <button
              type="button"
              onClick={async () => {
                await handleSignOut()
                handleCloseMenu()
              }}
              className="block w-full rounded-md px-3 py-2 text-left text-sm font-medium text-white transition hover:bg-gray-900"
            >
              Sign out
            </button>
          ) : (
            <>
              <NavLink to="/login" onClick={handleCloseMenu} className={mobileLinkClass}>
                Sign In
              </NavLink>
              <NavLink to="/register" onClick={handleCloseMenu} className={mobileLinkClass}>
                Sign up
              </NavLink>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar