import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FiFilter, FiSearch, FiEye, FiFileText } from 'react-icons/fi';
import { toast } from 'react-toastify';

// jobs are fetched from API for admin listing

const statusBadge = {
  Pending: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  Approved: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  Rejected: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
  Active: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
  Closed: 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
};

const AdminJobs = () => {
  const { authFetchJson } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedJob, setSelectedJob] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const body = await authFetchJson('/api/jobs');
      const list = body?.data ?? [];
      setJobs(list);
    } catch (err) {
      console.error('Failed to load admin jobs', err);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesSearch = `${job.title} ${job.employer ?? job.companyName ?? ''}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase().trim());
      if (statusFilter === 'All') return matchesSearch;
      // map backend statuses to UI-friendly text
      const mapped = job.status === 'published' ? 'Approved' : job.status === 'draft' ? 'Pending' : 'Closed';
      return matchesSearch && mapped === statusFilter;
    });
  }, [jobs, searchTerm, statusFilter]);

  const refresh = () => loadJobs();

  const setJobStatus = async (jobId, status) => {
    setActionLoading(jobId);
    try {
      await authFetchJson(`/api/jobs/${jobId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      await loadJobs();
    } catch (err) {
      console.error('Failed to update job status', err);
      alert(err.message ?? 'Failed to update job');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (jobId) => {
    if (!confirm('Delete this job? This action cannot be undone.')) return;
    setActionLoading(jobId);
    try {
      await authFetchJson(`/api/jobs/${jobId}`, { method: 'DELETE' });
      await loadJobs();
    } catch (err) {
      console.error('Failed to delete job', err);
      alert(err.message ?? 'Failed to delete job');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Job Management</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Approve new listings, monitor active contracts, and keep quality standards high.
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-indigo-200 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-indigo-500/60"
        >
          <FiFilter className="text-base" />
          Bulk actions
        </button>
      </header>

      <section className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex w-full items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 dark:border-slate-700 dark:bg-slate-900 lg:max-w-md">
            <FiSearch className="text-lg text-slate-400" />
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search job title or employer"
              className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400 dark:text-slate-200"
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
            >
              {['All', 'Pending', 'Approved', 'Rejected', 'Active', 'Closed'].map((statusOption) => (
                <option key={statusOption}>{statusOption}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="-mx-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-900/60">
              <tr className="text-left text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                <th scope="col" className="px-4 py-3">Job Title</th>
                <th scope="col" className="px-4 py-3">Employer</th>
                <th scope="col" className="px-4 py-3">Category</th>
                <th scope="col" className="px-4 py-3">Budget Type</th>
                <th scope="col" className="px-4 py-3">Date Posted</th>
                <th scope="col" className="px-4 py-3">Status</th>
                <th scope="col" className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredJobs.map((job) => (
                <tr
                  key={job.id}
                  className="transition hover:bg-slate-50/60 dark:hover:bg-slate-800/70"
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900 dark:text-white">{job.title}</div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{job.id}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{job.employerName ?? job.employer ?? job.companyName ?? ''}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{job.category ?? job.employmentType}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{job.budgetType ?? (job.salaryMin || job.salaryMax ? 'Range' : '')}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{job.createdAt ? new Date(job.createdAt).toLocaleDateString() : ''}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                        statusBadge[(job.status === 'published' ? 'Approved' : job.status === 'draft' ? 'Pending' : 'Closed')] || statusBadge.Pending
                      }`}
                    >
                      {job.status === 'published' ? 'Approved' : job.status === 'draft' ? 'Pending' : 'Closed'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex flex-wrap items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedJob(job)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-indigo-200 hover:text-indigo-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-indigo-500/60"
                      >
                        <FiEye className="text-base" />
                        Details
                      </button>
                      <button
                        type="button"
                        disabled={actionLoading === job.id}
                        onClick={() => setJobStatus(job.id, 'published')}
                        className="rounded-lg border border-transparent bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-600 transition hover:bg-emerald-500/20 dark:text-emerald-400 disabled:opacity-50"
                      >
                        {actionLoading === job.id && job.status !== 'published' ? '…' : 'Approve'}
                      </button>
                      <button
                        type="button"
                        disabled={actionLoading === job.id}
                        onClick={() => setJobStatus(job.id, 'closed')}
                        className="rounded-lg border border-transparent bg-rose-500/10 px-3 py-1.5 text-xs font-medium text-rose-600 transition hover:bg-rose-500/20 dark:text-rose-400 disabled:opacity-50"
                      >
                        {actionLoading === job.id && job.status !== 'closed' ? '…' : 'Reject'}
                      </button>
                      <button
                        type="button"
                        disabled={actionLoading === job.id}
                        onClick={() => handleDelete(job.id)}
                        className="rounded-lg border border-transparent bg-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 disabled:opacity-50"
                      >
                        {actionLoading === job.id ? '…' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredJobs.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 p-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-400">
            No job postings match your filters. Try broadening the search criteria.
          </div>
        )}
      </section>

      {selectedJob && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/50 px-4 py-6 backdrop-blur"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-900">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{selectedJob.title ?? ''}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {selectedJob.employer ?? selectedJob.employerName ?? selectedJob.companyName ?? ''} · {selectedJob.category ?? selectedJob.employmentType ?? ''}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedJob(null)}
                className="self-start rounded-full border border-transparent bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                Close
              </button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm dark:border-slate-800 dark:bg-slate-800/60">
                <p className="text-xs uppercase tracking-wide text-slate-400">Budget Type</p>
                <p className="mt-2 font-medium text-slate-900 dark:text-white">{selectedJob.budgetType ?? (selectedJob.salaryMin || selectedJob.salaryMax ? 'Range' : '')}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{selectedJob.budgetRange ?? (selectedJob.salaryMin || selectedJob.salaryMax ? `${selectedJob.salaryMin ?? ''} - ${selectedJob.salaryMax ?? ''}` : '')}</p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm dark:border-slate-800 dark:bg-slate-800/60">
                <p className="text-xs uppercase tracking-wide text-slate-400">Proposals</p>
                <p className="mt-2 font-medium text-slate-900 dark:text-white">{selectedJob.proposals ?? 0}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Active submissions awaiting review</p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm dark:border-slate-800 dark:bg-slate-800/60">
                <p className="text-xs uppercase tracking-wide text-slate-400">Date Posted</p>
                <p className="mt-2 font-medium text-slate-900 dark:text-white">{selectedJob.posted ?? (selectedJob.createdAt ? new Date(selectedJob.createdAt).toLocaleDateString() : '')}</p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm dark:border-slate-800 dark:bg-slate-800/60">
                <p className="text-xs uppercase tracking-wide text-slate-400">Status</p>
                <span
                  className={`mt-2 inline-flex w-fit rounded-full px-3 py-1 text-xs font-medium ${
                    statusBadge[(selectedJob.status === 'published' ? 'Approved' : selectedJob.status === 'draft' ? 'Pending' : 'Closed')] || statusBadge.Pending
                  }`}
                >
                  {selectedJob.status === 'published' ? 'Approved' : selectedJob.status === 'draft' ? 'Pending' : (selectedJob.status ?? '')}
                </span>
              </div>
            </div>

            <div className="mt-6 space-y-3 text-sm">
              <p className="text-xs uppercase tracking-wide text-slate-400">Brief</p>
              <p className="leading-relaxed text-slate-600 dark:text-slate-300">{selectedJob.description}</p>
            </div>

            {(selectedJob.attachments?.length ?? 0) > 0 && (
              <div className="mt-6">
                <p className="text-xs uppercase tracking-wide text-slate-400">Attachments</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(selectedJob.attachments || []).map((fileName) => (
                    <span
                      key={fileName}
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                    >
                      <FiFileText className="text-base text-indigo-500" />
                      {fileName}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 flex flex-wrap justify-end gap-3 text-sm">
              <button
                type="button"
                disabled={actionLoading === selectedJob?.id}
                onClick={async () => {
                  try {
                    await setJobStatus(selectedJob.id, 'draft');
                    setSelectedJob(null);
                    toast.info('Requested edits — job set to draft');
                  } catch (err) {
                    toast.error(err?.message ?? 'Failed to request edits');
                  }
                }}
                className="rounded-lg border border-slate-200 px-4 py-2 font-medium text-slate-600 transition hover:border-indigo-200 hover:text-indigo-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-indigo-500/60 disabled:opacity-50"
              >
                {actionLoading === selectedJob?.id ? '…' : 'Request edits'}
              </button>
              <button
                type="button"
                disabled={actionLoading === selectedJob?.id}
                onClick={async () => {
                  try {
                    await setJobStatus(selectedJob.id, 'published');
                    setSelectedJob(null);
                    toast.success('Job approved');
                  } catch (err) {
                    toast.error(err?.message ?? 'Failed to approve job');
                  }
                }}
                className="rounded-lg border border-transparent bg-emerald-500 px-4 py-2 font-medium text-white shadow-sm transition hover:bg-emerald-500/90 disabled:opacity-50"
              >
                {actionLoading === selectedJob?.id ? '…' : 'Mark as approved'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminJobs;
