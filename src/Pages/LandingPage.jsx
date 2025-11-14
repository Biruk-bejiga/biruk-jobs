import { NavLink } from 'react-router-dom'
import heroImage from '../assets/image/background-image.jpg'

const roles = [
  {
    slug: 'client',
    title: 'I am a client',
    subtitle: 'Find skilled freelancers to build your next project.',
    registerLabel: 'Join as a client',
    registerTo: '/register/employer',
    loginTo: '/login',
    accentClass: 'from-emerald-100 via-white to-white',
  },
  {
    slug: 'freelancer',
    title: 'I am a freelancer',
    subtitle: 'Discover projects that match your skills and get hired fast.',
    registerLabel: 'Join as a freelancer',
    registerTo: '/register/employee',
    loginTo: '/login',
    accentClass: 'from-indigo-100 via-white to-white',
  },
]

const LandingPage = () => {
  return (
    <div className="flex min-h-[calc(100vh-5rem)] flex-col bg-slate-50">
      <section className="relative isolate overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-20 text-white">
        <div className="absolute inset-0 opacity-10">
          <img
            src={heroImage}
            alt="Creative team collaborating"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="relative mx-auto flex max-w-5xl flex-col items-center gap-6 px-6 text-center">
          <span className="rounded-full bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-emerald-200">
            Built for modern hiring
          </span>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Work the way you want on Dev Jobs
          </h1>
          <p className="max-w-2xl text-base text-slate-200 sm:text-lg">
            Choose the experience that fits you best. Whether you need to scale your team or showcase your talent,
            Dev Jobs connects clients and freelancers with tools inspired by the Upwork platform.
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl -mt-16 space-y-12 px-6 pb-16">
        <div className="grid gap-8 md:grid-cols-2">
          {roles.map((role) => (
            <div
              key={role.slug}
              className={`group relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br p-10 shadow-lg transition hover:-translate-y-1 hover:shadow-xl ${role.accentClass}`}
            >
              <div className="flex h-full flex-col gap-6">
                <div>
                  <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
                    {role.slug === 'client' ? 'Client experience' : 'Freelancer experience'}
                  </span>
                  <h2 className="mt-4 text-2xl font-semibold text-slate-900">{role.title}</h2>
                  <p className="mt-2 text-sm text-slate-600 sm:text-base">{role.subtitle}</p>
                </div>

                <div className="mt-auto flex flex-col gap-3">
                  <NavLink
                    to={role.registerTo}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600"
                  >
                    {role.registerLabel}
                  </NavLink>
                  <NavLink
                    to={role.loginTo}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-transparent px-5 py-3 text-sm font-semibold text-emerald-700 transition hover:border-emerald-200 hover:bg-emerald-50"
                  >
                    I already have an account
                  </NavLink>
                </div>
              </div>

              <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-emerald-400/20 blur-3xl transition duration-300 group-hover:bg-emerald-400/30" />
            </div>
          ))}
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow">
          <h3 className="text-xl font-semibold text-slate-900">Why teams choose Dev Jobs</h3>
          <p className="mt-3 max-w-3xl text-sm text-slate-600">
            Build long-term partnerships with talent or assemble a flexible workforce in days. Our curated experience
            keeps clients and freelancers on focused dashboards tailored to their goals.
          </p>
        </div>
      </section>
    </div>
  )
}

export default LandingPage
