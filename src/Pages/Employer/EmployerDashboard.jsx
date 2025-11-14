import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../../Comonent/Spinner';
import Hero from '../../Comonent/Hero'
import Card from '../../Comonent/Card'

const EmployerDashboard = () => {
  const { authFetchJson } = useAuth();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['employer', 'me'],
    queryFn: async () => {
      const response = await authFetchJson('/api/employers/me');
      return response?.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Spinner loading />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-700">
        {error?.message ?? 'Failed to load dashboard'}
      </div>
    );
  }

  const profile = data?.profile;
  const stats = data?.stats ?? {};

  const statCards = [
    { label: 'Total Jobs', value: stats.totalJobs ?? 0 },
    { label: 'Published', value: stats.publishedJobs ?? 0 },
    { label: 'Drafts', value: stats.draftJobs ?? 0 },
    { label: 'Closed', value: stats.closedJobs ?? 0 },
  ];

  return (
    <>
      <Hero title={`Welcome back, ${profile?.fullName ?? 'team'}`} subtitle="Manage your hiring pipeline and job posts" />

      <div className="container m-auto space-y-8 py-6 px-6">
        <section>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {statCards.map((card) => (
              <Card key={card.label}>
                <dt className="text-sm font-medium text-slate-500 dark:text-slate-300">{card.label}</dt>
                <dd className="mt-2 text-2xl font-semibold text-emerald-600 dark:text-emerald-300">{card.value}</dd>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900/50">
            <header className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Company snapshot</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Stay consistent across job posts and candidate touchpoints.</p>
              </div>
            </header>
            <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Company</dt>
                <dd className="mt-2 text-sm font-medium text-slate-900 dark:text-slate-100">{profile?.companyName ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Website</dt>
                <dd className="mt-2 text-sm text-emerald-600 dark:text-emerald-300">
                  {profile?.companyWebsite ? (
                    <a href={profile.companyWebsite} target="_blank" rel="noreferrer" className="hover:underline">
                      {profile.companyWebsite}
                    </a>
                  ) : (
                    '—'
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Industry</dt>
                <dd className="mt-2 text-sm text-slate-900 dark:text-slate-100">{profile?.industry ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Company size</dt>
                <dd className="mt-2 text-sm text-slate-900 dark:text-slate-100">{profile?.companySize ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Headquarters</dt>
                <dd className="mt-2 text-sm text-slate-900 dark:text-slate-100">{profile?.headquarters ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Founded</dt>
                <dd className="mt-2 text-sm text-slate-900 dark:text-slate-100">{profile?.foundedYear ?? '—'}</dd>
              </div>
            </dl>
          </div>
        </section>
      </div>
    </>
  );
};

export default EmployerDashboard;
