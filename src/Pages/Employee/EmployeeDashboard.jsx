import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import Spinner from '../../Comonent/Spinner';
import { useAuth } from '../../context/AuthContext';
import Hero from '../../Comonent/Hero'
import Card from '../../Comonent/Card'

const EmployeeDashboard = () => {
  const { authFetchJson } = useAuth();

  const profileQuery = useQuery({
    queryKey: ['employee', 'me'],
    queryFn: async () => {
      const response = await authFetchJson('/api/employees/me');
      return response?.data ?? {};
    },
  });

  const applicationsQuery = useQuery({
    queryKey: ['employee', 'applications'],
    queryFn: async () => {
      const response = await authFetchJson('/api/employees/applications');
      return response?.data ?? [];
    },
  });

  if (profileQuery.isLoading || applicationsQuery.isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Spinner loading />
      </div>
    );
  }

  if (profileQuery.isError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-700">
        {profileQuery.error?.message ?? 'Unable to load profile'}
      </div>
    );
  }

  const profile = profileQuery.data;
  const applications = Array.isArray(applicationsQuery.data) ? applicationsQuery.data : [];

  const counts = applications.reduce(
    (acc, item) => {
      acc.total += 1;
      acc[item.application.status] = (acc[item.application.status] ?? 0) + 1;
      return acc;
    },
    { total: 0 },
  );

  const statCards = [
    { label: 'Total applications', value: counts.total },
    { label: 'In review', value: counts.in_review ?? 0 },
    { label: 'Shortlisted', value: counts.shortlisted ?? 0 },
    { label: 'Offers', value: counts.hired ?? 0 },
  ];

  const recent = applications.slice(0, 5);

  return (
    <>
      <Hero title={`Welcome, ${profile.fullName ?? 'talent'}`} subtitle="Browse roles and track your applications" />

      <div className="container m-auto space-y-8 py-6 px-6">
        <section>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {statCards.map((card) => (
              <Card key={card.label}>
                <dt className="text-sm font-medium text-slate-500 dark:text-slate-300">{card.label}</dt>
                <dd className="mt-2 text-2xl font-semibold text-indigo-600 dark:text-indigo-300">{card.value}</dd>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900/50">
            <header className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Recent applications</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Track feedback and next steps from hiring teams.</p>
              </div>
              <Link
                to="/employee/applications"
                className="rounded-xl border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:border-indigo-200 hover:text-indigo-600 dark:border-slate-700 dark:text-slate-200 dark:hover:border-indigo-400 dark:hover:text-indigo-300"
              >
                View all
              </Link>
            </header>
            {recent.length === 0 ? (
              <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">You haven’t applied to any roles yet. Explore jobs tailored to your skills.</p>
            ) : (
              <ul className="mt-6 divide-y divide-slate-200 text-sm dark:divide-slate-800 dark:text-slate-200">
                {recent.map((entry) => (
                  <li key={entry.application.id} className="flex flex-wrap items-center justify-between gap-2 py-4">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-slate-100">{entry.job.title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{entry.job.location}</p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-indigo-200">
                      {entry.application.status.replace('_', ' ')}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900/50">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Profile status</h3>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Headline</dt>
                <dd className="mt-2 text-sm text-slate-900 dark:text-slate-100">{profile.headline || 'Add a short professional summary'}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Location</dt>
                <dd className="mt-2 text-sm text-slate-900 dark:text-slate-100">{profile.profileLocation || profile.location || 'Set your location'}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Résumé</dt>
                <dd className="mt-2 text-sm">
                  {profile.resumeUrl ? (
                    <a
                      href={profile.resumeUrl}
                      className="text-indigo-600 hover:underline dark:text-indigo-300"
                      target="_blank"
                      rel="noreferrer"
                    >
                      View uploaded résumé
                    </a>
                  ) : (
                    <span className="text-slate-500 dark:text-slate-400">Upload the latest résumé</span>
                  )}
                </dd>
              </div>
            </dl>
          </div>
        </section>
      </div>
    </>
  );
};

export default EmployeeDashboard;
