import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { FiEdit, FiPlus, FiTrash2 } from 'react-icons/fi';
import { toast } from 'react-toastify';
import Spinner from '../../Comonent/Spinner';
import { useAuth } from '../../context/AuthContext';

const statusLabels = {
  draft: { label: 'Draft', className: 'bg-slate-100 text-slate-600' },
  published: { label: 'Published', className: 'bg-emerald-100 text-emerald-600' },
  closed: { label: 'Closed', className: 'bg-rose-100 text-rose-600' },
};

const EmployerJobs = () => {
  const { authFetchJson } = useAuth();
  const [statusFilter, setStatusFilter] = useState('all');

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['employer', 'jobs', statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') {
        params.set('status', statusFilter);
      }
      const response = await authFetchJson(`/api/employers/jobs?${params.toString()}`);
      return response?.data ?? [];
    },
  });

  const jobs = useMemo(() => data ?? [], [data]);

  const handleDelete = async (jobId) => {
    try {
      await authFetchJson(`/api/jobs/${jobId}`, { method: 'DELETE' }, 'Failed to delete job');
      toast.success('Job deleted');
      await refetch();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Job listings</h2>
          <p className="text-sm text-slate-500">Draft, publish, or archive open roles.</p>
        </div>
        <Link
          to="/add-job"
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
        >
          <FiPlus />
          Create job
        </Link>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        {['all', 'draft', 'published', 'closed'].map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setStatusFilter(status)}
            className={`rounded-xl border px-3 py-1.5 text-sm font-medium transition ${
              statusFilter === status
                ? 'border-indigo-200 bg-indigo-50 text-indigo-600'
                : 'border-slate-200 text-slate-600 hover:border-indigo-200 hover:text-indigo-600'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <Spinner loading />
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-700">
          {error?.message ?? 'Failed to load jobs'}
        </div>
      ) : jobs.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white px-6 py-10 text-center text-sm text-slate-500">
          No jobs found. Create your first role to start attracting applicants.
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => {
            const badge = statusLabels[job.status] ?? statusLabels.draft;
            return (
              <article
                key={job.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{job.title}</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {job.location} • {job.employmentType?.replace('_', ' ')}
                    </p>
                    <p className="mt-2 text-sm text-slate-500 line-clamp-2">{job.summary ?? job.description}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2 text-right">
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${badge.className}`}>
                      {badge.label}
                    </span>
                    <p className="text-xs text-slate-400">
                      Updated {new Date(job.updatedAt ?? job.createdAt).toLocaleDateString()}
                    </p>
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/edit-job/${job.id}`}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:border-indigo-200 hover:text-indigo-600"
                      >
                        <FiEdit /> Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(job.id)}
                        className="inline-flex items-center gap-1 rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50"
                      >
                        <FiTrash2 /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default EmployerJobs;
