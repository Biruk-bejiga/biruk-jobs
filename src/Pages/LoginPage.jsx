import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuth } from '../context/AuthContext'

const getDefaultDashboardPath = (role) => {
  switch (role) {
    case 'admin':
      return '/admin'
    case 'employer':
      return '/employer'
    case 'employee':
      return '/employee'
    default:
      return '/'
  }
}

const AUTH_PAGE_PREFIXES = ['/login', '/register']

const isPathAllowedForRole = (role, pathname) => {
  if (!pathname) {
    return true
  }

  if (AUTH_PAGE_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return false
  }

  if (pathname.startsWith('/admin')) {
    return role === 'admin'
  }
  if (pathname.startsWith('/employer')) {
    return role === 'employer'
  }
  if (pathname.startsWith('/employee')) {
    return role === 'employee'
  }

  return true
}

const getRedirectDestination = (role, fromPath) => {
  const fallbackPath = getDefaultDashboardPath(role)

  if (!fromPath) {
    return fallbackPath
  }

  if (!isPathAllowedForRole(role, fromPath)) {
    return fallbackPath
  }

  return fromPath
}

const LoginPage = () => {
  const { login, isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const fromPath = location.state?.from?.pathname
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) return

    const redirectTo = getRedirectDestination(user?.role, fromPath)

    if (redirectTo && location.pathname !== redirectTo) {
      navigate(redirectTo, { replace: true })
    }
  }, [fromPath, isAuthenticated, navigate, user?.role, location.pathname])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const userData = await login(email.trim(), password)
      toast.success('Welcome back!')
      const redirectPath = getRedirectDestination(userData?.role, fromPath)
      navigate(redirectPath, { replace: true })
    } catch (err) {
      const message = err?.message ?? 'Unable to sign in. Please try again.'
      setError(message)
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className='flex min-h-[calc(100vh-80px)] items-center justify-center bg-slate-100 py-12'>
      <div className='w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-lg'>
        <h1 className='mb-2 text-center text-3xl font-semibold text-slate-900'>Sign in</h1>
        <p className='mb-6 text-center text-sm text-slate-500'>Access the FlexiSphere admin console and job management tools.</p>

        {error ? (
          <div className='mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700'>
            {error}
          </div>
        ) : null}

        <form className='space-y-5' onSubmit={handleSubmit}>
          <div>
            <label className='mb-1 block text-sm font-medium text-slate-700' htmlFor='email'>
              Email address
            </label>
            <input
              id='email'
              type='email'
              autoComplete='email'
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className='block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500'
              placeholder='you@example.com'
            />
          </div>

          <div>
            <label className='mb-1 block text-sm font-medium text-slate-700' htmlFor='password'>
              Password
            </label>
            <input
              id='password'
              type='password'
              autoComplete='current-password'
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className='block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500'
              placeholder='••••••••'
            />
          </div>

          <button
            type='submit'
            disabled={isSubmitting}
            className='flex w-full items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300'
          >
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className='mt-6 text-center text-sm text-slate-500'>
          Need a user account?{' '}
          <Link to='/register' className='font-medium text-indigo-600 hover:text-indigo-500'>Create an account</Link>
          .
        </p>
      </div>
    </section>
  )
}

export default LoginPage
