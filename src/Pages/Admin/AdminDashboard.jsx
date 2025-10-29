import { FiUsers, FiBriefcase, FiCheckCircle, FiClock, FiDollarSign } from 'react-icons/fi';

const summaryCards = [
  {
    label: 'Total Registered Users',
    value: '25,482',
    delta: '+4.3% vs last month',
    icon: <FiUsers className="text-2xl" aria-hidden="true" />,
    accent: 'from-indigo-500/20 via-indigo-500/10 to-transparent',
  },
  {
    label: 'Active Job Listings',
    value: '1,287',
    delta: '312 pending moderation',
    icon: <FiBriefcase className="text-2xl" aria-hidden="true" />,
    accent: 'from-emerald-500/20 via-emerald-500/10 to-transparent',
  },
  {
    label: 'Completed Projects',
    value: '9,842',
    delta: '+380 in the last 7 days',
    icon: <FiCheckCircle className="text-2xl" aria-hidden="true" />,
    accent: 'from-sky-500/20 via-sky-500/10 to-transparent',
  },
  {
    label: 'Pending User Approvals',
    value: '64',
    delta: '52 freelancers · 12 employers',
    icon: <FiClock className="text-2xl" aria-hidden="true" />,
    accent: 'from-amber-500/20 via-amber-500/10 to-transparent',
  },
  {
    label: 'Platform Revenue',
    value: '$387K',
    delta: '+12.4% QoQ growth',
    icon: <FiDollarSign className="text-2xl" aria-hidden="true" />,
    accent: 'from-purple-500/20 via-purple-500/10 to-transparent',
  },
];

const activities = [
  {
    id: 1,
    title: 'High-value contract completed',
    description: 'UX Design project by Studio Eleven was marked complete with a $12,300 payout.',
    time: '12 minutes ago',
    category: 'success',
  },
  {
    id: 2,
    title: 'New dispute filed',
    description: 'Employer “Bright Labs” flagged milestone #2 for project “Mobile Banking MVP”.',
    time: '28 minutes ago',
    category: 'warning',
  },
  {
    id: 3,
    title: 'Verification reminder',
    description: '12 freelancers require ID verification to unlock withdrawals.',
    time: '1 hour ago',
    category: 'info',
  },
  {
    id: 4,
    title: 'Top employer onboarded',
    description: '“Lighthouse Media” created its company profile and requested enterprise SLA.',
    time: 'Yesterday',
    category: 'success',
  },
  {
    id: 5,
    title: 'Revenue threshold reached',
    description: 'Weekly fee collections crossed the $80k mark for the first time this quarter.',
    time: '2 days ago',
    category: 'info',
  },
];

const badgeStyles = {
  success: 'bg-emerald-500/10 text-emerald-500',
  warning: 'bg-amber-500/10 text-amber-500',
  info: 'bg-indigo-500/10 text-indigo-500',
};

const AdminDashboard = () => {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Dashboard Overview</h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Monitor live platform health, revenue trajectory, and operational workload.
        </p>
      </section>

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {summaryCards.map((card) => (
          <article
            key={card.label}
            className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900"
          >
            <div
              aria-hidden="true"
              className={`pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-gradient-to-br ${card.accent}`}
            />
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  {card.label}
                </p>
                <p className="mt-4 text-3xl font-semibold text-slate-900 dark:text-white">{card.value}</p>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{card.delta}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-indigo-600 dark:bg-slate-800 dark:text-indigo-400">
                {card.icon}
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-3">
          <header className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Conversion Funnel</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Snapshot of onboarding flow from sign-up to first hire.
              </p>
            </div>
            <button
              type="button"
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:border-indigo-200 hover:text-indigo-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-indigo-500/50"
            >
              View report
            </button>
          </header>

          <div className="space-y-4">
            {[
              { label: 'Signup Completion', value: 84 },
              { label: 'Profile Verification', value: 72 },
              { label: 'First Proposal Sent', value: 58 },
              { label: 'First Contract Signed', value: 41 },
            ].map((step) => (
              <div key={step.label} className="space-y-2">
                <div className="flex items-center justify-between text-sm font-medium">
                  <span className="text-slate-600 dark:text-slate-300">{step.label}</span>
                  <span className="text-slate-900 dark:text-white">{step.value}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500"
                    style={{ width: `${step.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
          <header className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Activity</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                System notifications and manual interventions.
              </p>
            </div>
            <button
              type="button"
              className="text-sm font-medium text-indigo-600 transition hover:text-indigo-500 dark:text-indigo-400"
            >
              See all
            </button>
          </header>
          <ul className="divide-y divide-slate-200 dark:divide-slate-800">
            {activities.map((activity) => (
              <li key={activity.id} className="flex gap-4 px-6 py-4">
                <span
                  className={`mt-1 inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-sm font-semibold ${
                    badgeStyles[activity.category]
                  }`}
                >
                  {activity.category === 'success' && '✓'}
                  {activity.category === 'warning' && '!'}
                  {activity.category === 'info' && 'i'}
                </span>
                <div className="space-y-1 text-sm">
                  <p className="font-medium text-slate-900 dark:text-white">{activity.title}</p>
                  <p className="text-slate-500 dark:text-slate-400">{activity.description}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">{activity.time}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;
