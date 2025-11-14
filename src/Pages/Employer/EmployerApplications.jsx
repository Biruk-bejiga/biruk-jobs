import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FiExternalLink, FiMail, FiUserCheck } from 'react-icons/fi';
import Spinner from '../../Comonent/Spinner';
import { useAuth } from '../../context/AuthContext';

const statusPill = {
  submitted: {
    light: 'bg-slate-100 text-slate-600',
    dark: 'dark:bg-slate-800/70 dark:text-slate-200',
  },
  in_review: {
    light: 'bg-emerald-100 text-emerald-600',
    dark: 'dark:bg-emerald-500/20 dark:text-emerald-200',
  },
  shortlisted: {
    light: 'bg-emerald-100 text-emerald-600',
    dark: 'dark:bg-emerald-500/20 dark:text-emerald-200',
  },
  rejected: {
    light: 'bg-rose-100 text-rose-600',
    dark: 'dark:bg-rose-500/20 dark:text-rose-200',
  },
  withdrawn: {
    light: 'bg-amber-100 text-amber-600',
    dark: 'dark:bg-amber-500/20 dark:text-amber-200',
  },
  hired: {
    light: 'bg-sky-100 text-sky-600',
    dark: 'dark:bg-sky-500/20 dark:text-sky-200',
  },
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

  const jobs = useMemo(() => jobsQuery.data ?? [], [jobsQuery.data]);

  const applicationsQuery = useQuery({
    queryKey: ['employer', 'applications', jobId || 'all', jobs.map((job) => job.id)],
    enabled: jobsQuery.isSuccess,
    queryFn: async () => {
      if (!jobs.length) {
        return [];
      }

      const targetJobs = jobId ? jobs.filter((job) => job.id === jobId) : jobs;

      if (!targetJobs.length) {
        return [];
      }

      const fetchForJob = async (job) => {
        const response = await authFetchJson(
          `/api/employers/jobs/${job.id}/applications`,
          {},
          'Failed to load applications',
        );
        const entries = response?.data ?? [];
        return entries.map((entry) => ({
          ...entry,
          job: {
            id: job.id,
            title: job.title,
            location: job.location,
          },
        }));
      };

      const results = await Promise.all(targetJobs.map(fetchForJob));
      return results
        .flat()
        .sort((a, b) => new Date(b.application.submittedAt) - new Date(a.application.submittedAt));
    },
  });

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
            className="mt-2 w-72 rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
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

      {applicationsQuery.isLoading ? (
        <div className="flex justify-center py-10">
          <Spinner loading />
        </div>
      ) : null}

      {!applicationsQuery.isLoading && applicationsQuery.isError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-700">
          {applicationsQuery.error?.message ?? 'Unable to load applications'}
        </div>
      ) : null}

      {!applicationsQuery.isLoading && !applicationsQuery.isError ? (
        applications.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white px-6 py-10 text-center text-sm text-slate-500">
            {jobId ? 'No applications yet. Share your job to reach more candidates.' : 'No applications found across your jobs yet.'}
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((entry) => {
              const { light: statusLight, dark: statusDark } =
                statusPill[entry.application.status] ?? statusPill.submitted;
              const submittedDate = entry.application.submittedAt ? new Date(entry.application.submittedAt) : null;
              const submittedLabel = submittedDate
                ? submittedDate.toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : null;
              const avatarInitials = (entry.applicant.fullName ?? 'Applicant')
                .split(' ')
                .map((part) => part.charAt(0)?.toUpperCase())
                .filter(Boolean)
                .slice(0, 2)
                .join('');
              return (
                <article
                  key={entry.application.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900/50"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex flex-1 flex-wrap items-start gap-4">
                      {entry.applicant.avatarUrl ? (
                        <img
                          src={entry.applicant.avatarUrl}
                          alt={entry.applicant.fullName}
                          className="h-12 w-12 rounded-full object-cover shadow-sm"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold uppercase text-emerald-600 shadow-sm dark:bg-emerald-500/20 dark:text-emerald-200">
                          {avatarInitials}
                        </div>
                      )}
                      <div className="min-w-[12rem] flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="inline-flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-slate-100">
                            {entry.applicant.fullName}
                          </span>
                          {entry.profile?.headline ? (
                            <span className="text-sm text-slate-500 dark:text-slate-300">{entry.profile.headline}</span>
                          ) : null}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                          <span>{entry.applicant.email}</span>
                          {entry.profile?.location ? <span>{entry.profile.location}</span> : null}
                          {typeof entry.profile?.yearsExperience === 'number' ? (
                            <span>{entry.profile.yearsExperience} yrs experience</span>
                          ) : null}
                          {submittedLabel ? <span>Applied {submittedLabel}</span> : null}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
                          <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-slate-600 dark:bg-slate-800 dark:text-slate-200">
                            {entry.job?.title ?? 'Unassigned role'}
                          </span>
                          {entry.job?.location ? (
                            <span className="inline-flex items-center rounded-full border border-slate-200 px-3 py-1 text-slate-500 dark:border-slate-700 dark:text-slate-300">
                              {entry.job.location}
                            </span>
                          ) : null}
                          <span
                            className={`inline-flex items-center rounded-full px-3 py-1 capitalize ${statusLight} ${statusDark}`}
                          >
                            {entry.application.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-stretch justify-center gap-2 sm:flex-row sm:items-center">
                      {entry.profile?.resumeUrl ? (
                        <a
                          href={entry.profile.resumeUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-emerald-200 hover:text-emerald-600 dark:border-slate-700 dark:text-slate-200"
                        >
                          <FiExternalLink className="text-base" /> Résumé
                        </a>
                      ) : null}
                      <button
                        type="button"
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-emerald-200 hover:text-emerald-600 dark:border-slate-700 dark:text-slate-200"
                      >
                        <FiMail className="text-base" /> Message
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-600 transition hover:bg-emerald-100 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-300"
                      >
                        <FiUserCheck className="text-base" /> Advance
                      </button>
                    </div>
                  </div>

                  {entry.application.coverLetter ? (
                    <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-relaxed text-slate-600 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Cover letter</p>
                      <p className="mt-2 whitespace-pre-line text-sm">{entry.application.coverLetter}</p>
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        )
      ) : null}
    </div>
  );
};

export default EmployerApplications;
