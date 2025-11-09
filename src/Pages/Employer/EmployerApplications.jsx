import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FiExternalLink, FiMail, FiUserCheck } from 'react-icons/fi';
import Spinner from '../../Comonent/Spinner';
import { useAuth } from '../../context/AuthContext';

const statusPill = {
  submitted: 'bg-slate-100 text-slate-600',
  in_review: 'bg-indigo-100 text-indigo-600',
  shortlisted: 'bg-emerald-100 text-emerald-600',
  rejected: 'bg-rose-100 text-rose-600',
  withdrawn: 'bg-amber-100 text-amber-600',
  hired: 'bg-sky-100 text-sky-600',
};

const EmployerApplications = () => {
  const { authFetchJson } = useAuth();
  const [jobId, setJobId] = useState('');

  const jobsQuery = useQuery({
    queryKey: ['employer', 'jobs', 'for-applications'],
    queryFn: async () => {
      const response = await authFetchJson('/api/employers/jobs');
      return response?.data ?? [];
    },
  });

  const applicationsQuery = useQuery({
    queryKey: ['employer', 'applications', jobId],
    enabled: Boolean(jobId),
    queryFn: async () => {
      const response = await authFetchJson(`/api/employers/jobs/${jobId}/applications`, {}, 'Failed to load applications');
      return response?.data ?? [];
    },
  });

  const jobs = useMemo(() => jobsQuery.data ?? [], [jobsQuery.data]);
  const applications = useMemo(() => applicationsQuery.data ?? [], [applicationsQuery.data]);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Applications</h2>
          <p className="text-sm text-slate-500">Review applicants by job and collaborate with your team.</p>
        </div>
        <div>
          <label className="text-xs font-medium uppercase tracking-wide text-slate-500" htmlFor="job-filter">
            Filter by job
          </label>
          <select
            id="job-filter"
            value={jobId}
            onChange={(event) => setJobId(event.target.value)}
            className="mt-2 w-72 rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          >
            <option value="">Select a role</option>
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.title} — {job.location}
              </option>
            ))}
          </select>
        </div>
      </header>

      {jobsQuery.isLoading ? (
        <div className="flex justify-center py-10">
          <Spinner loading />
        </div>
      ) : jobs.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white px-6 py-10 text-center text-sm text-slate-500">
          Publish your first job to start collecting applications.
        </div>
      ) : null}

      {jobId && applicationsQuery.isLoading ? (
        <div className="flex justify-center py-10">
          <Spinner loading />
        </div>
      ) : null}

      {jobId && applicationsQuery.isError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-700">
          {applicationsQuery.error?.message ?? 'Unable to load applications'}
        </div>
      ) : null}

      {jobId && !applicationsQuery.isLoading && !applicationsQuery.isError ? (
        applications.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white px-6 py-10 text-center text-sm text-slate-500">
            No applications yet. Share your job to reach more candidates.
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Applicant</th>
                  <th className="px-4 py-3 font-semibold">Headline</th>
                  <th className="px-4 py-3 font-semibold">Experience</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white text-sm text-slate-700">
                {applications.map((entry) => {
                  const statusClass = statusPill[entry.application.status] ?? statusPill.submitted;
                  return (
                    <tr key={entry.application.id}>
                      <td className="px-4 py-4">
                        <div className="font-medium text-slate-900">{entry.applicant.fullName}</div>
                        <div className="text-xs text-slate-500">{entry.applicant.email}</div>
                      </td>
                      <td className="px-4 py-4">
                        {entry.profile?.headline ?? '—'}
                        {entry.profile?.location ? (
                          <div className="text-xs text-slate-400">{entry.profile.location}</div>
                        ) : null}
                      </td>
                      <td className="px-4 py-4 text-slate-500">
                        {typeof entry.profile?.yearsExperience === 'number'
                          ? `${entry.profile.yearsExperience} yrs`
                          : '—'}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusClass}`}>
                          {entry.application.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          {entry.profile?.resumeUrl ? (
                            <a
                              href={entry.profile.resumeUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-600 hover:border-indigo-200 hover:text-indigo-600"
                            >
                              <FiExternalLink /> Résumé
                            </a>
                          ) : null}
                          <button
                            type="button"
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-600 hover:border-indigo-200 hover:text-indigo-600"
                          >
                            <FiMail /> Message
                          </button>
                          <button
                            type="button"
                            className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 px-3 py-1.5 text-xs text-emerald-600 hover:bg-emerald-50"
                          >
                            <FiUserCheck /> Advance
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      ) : null}
    </div>
  );
};

export default EmployerApplications;
