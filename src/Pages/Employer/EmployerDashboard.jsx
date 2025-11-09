import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../../Comonent/Spinner';

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
    <div className="space-y-8">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Welcome back, {profile?.fullName ?? 'team'}</h2>
        <p className="mt-1 text-sm text-slate-500">
          Manage your hiring pipeline, monitor application activity, and keep your employer brand sharp.
        </p>
        <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((card) => (
            <div
              key={card.label}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-5 text-center"
            >
              <dt className="text-sm font-medium text-slate-500">{card.label}</dt>
              <dd className="mt-2 text-2xl font-semibold text-indigo-600">{card.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <header className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Company snapshot</h3>
            <p className="text-sm text-slate-500">Stay consistent across job posts and candidate touchpoints.</p>
          </div>
        </header>
        <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-500">Company</dt>
            <dd className="mt-2 text-sm font-medium text-slate-900">{profile?.companyName ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-500">Website</dt>
            <dd className="mt-2 text-sm text-indigo-600">
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
            <dt className="text-xs uppercase tracking-wide text-slate-500">Industry</dt>
            <dd className="mt-2 text-sm text-slate-900">{profile?.industry ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-500">Company size</dt>
            <dd className="mt-2 text-sm text-slate-900">{profile?.companySize ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-500">Headquarters</dt>
            <dd className="mt-2 text-sm text-slate-900">{profile?.headquarters ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-500">Founded</dt>
            <dd className="mt-2 text-sm text-slate-900">{profile?.foundedYear ?? '—'}</dd>
          </div>
        </dl>
      </section>
    </div>
  );
};

export default EmployerDashboard;
