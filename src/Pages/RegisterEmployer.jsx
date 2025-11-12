import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuth } from '../context/AuthContext'
import { resolveApiUrl } from '../lib/apiClient'

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

const RegisterEmployer = () => {
  const navigate = useNavigate()
  const { login, initializeSession } = useAuth()
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirm: '',
    companyName: '',
    companyWebsite: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.fullName || !form.email || !form.password || !form.companyName) {
      toast.error('Please fill required fields')
      return
    }
    if (form.password.length < 12) {
      toast.error('Password must be at least 12 characters')
      return
    }
    if (form.password !== form.confirm) {
      toast.error('Passwords do not match')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch(resolveApiUrl('/api/auth/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          role: 'employer',
          email: form.email,
          password: form.password,
          fullName: form.fullName,
          companyName: form.companyName,
          companyWebsite: form.companyWebsite || undefined,
        }),
      })
      if (!res.ok) {
        let msg = await res.text()
        try {
          const body = JSON.parse(msg)
          msg = body?.error?.message ?? body?.message ?? msg
        } catch (err) {
          // swallow
        }
        throw new Error(msg || 'Registration failed')
      }

      const body = await res.json()
      const token = body?.data?.accessToken ?? null
      let nextUser = body?.data?.user ?? null

      if (token && nextUser) {
        initializeSession(token, nextUser)
      } else {
        nextUser = await login(form.email, form.password)
      }

      toast.success('Welcome — account created')
      const redirect = getDefaultDashboardPath(nextUser?.role)
      navigate(redirect, { replace: true })
    } catch (err) {
      toast.error(err.message ?? 'Registration failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-slate-100 py-12">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
        <h1 className="mb-2 text-center text-2xl font-semibold text-slate-900">Create an employer account</h1>
        <p className="mb-6 text-center text-sm text-slate-500">Create an employer account to post jobs and manage applicants.</p>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Your name</label>
            <input name="fullName" value={form.fullName} onChange={handleChange} required className="w-full rounded-xl border px-3 py-2" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} required className="w-full rounded-xl border px-3 py-2" />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
              <input name="password" type="password" value={form.password} onChange={handleChange} required className="w-full rounded-xl border px-3 py-2" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Confirm</label>
              <input name="confirm" type="password" value={form.confirm} onChange={handleChange} required className="w-full rounded-xl border px-3 py-2" />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Company name</label>
            <input name="companyName" value={form.companyName} onChange={handleChange} required className="w-full rounded-xl border px-3 py-2" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Company website (optional)</label>
            <input name="companyWebsite" value={form.companyWebsite} onChange={handleChange} className="w-full rounded-xl border px-3 py-2" />
          </div>

          <div className="flex justify-end">
            <button disabled={isSubmitting} type="submit" className="rounded-xl bg-indigo-600 px-4 py-2 text-white">
              {isSubmitting ? 'Creating…' : 'Create account'}
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}

export default RegisterEmployer
