import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { FiBookmark, FiBriefcase, FiMapPin, FiSearch, FiSliders } from 'react-icons/fi';
import Spinner from '../../Comonent/Spinner';
import QuickApplyModal from '../../Comonent/QuickApplyModal';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const employmentTypes = [
  { value: '', label: 'Any type' },
  { value: 'full_time', label: 'Full-time' },
  { value: 'part_time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'temporary', label: 'Temporary' },
  { value: 'internship', label: 'Internship' },
];

const EmployeeJobs = () => {
  const { authFetchJson, user } = useAuth();
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [employmentType, setEmploymentType] = useState('');
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  const query = useQuery({
    queryKey: ['jobs', { search, location, employmentType, remoteOnly }],
    queryFn: async () => {
      const params = new URLSearchParams({ status: 'published' });
      if (search.trim()) params.set('search', search.trim());
      if (location.trim()) params.set('location', location.trim());
      if (employmentType) params.set('employmentType', employmentType);
      if (remoteOnly) params.set('isRemote', 'true');
      const response = await authFetchJson(`/api/jobs?${params.toString()}`);
      return response?.data ?? [];
    },
  });

  const jobs = Array.isArray(query.data) ? query.data : [];
  const queryClient = useQueryClient();

  const handleFavorite = async (jobId) => {
    try {
      await authFetchJson('/api/employees/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId }),
      });
      toast.success('Saved to favorites');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleApply = (jobId) => {
    if (!user) {
      toast.info('Please sign in to apply');
      return;
    }
    // open quick-apply modal instead of instant apply
    setSelectedJob(jobId)
  };
  const handleModalApplied = () => {
    queryClient.invalidateQueries({ queryKey: ['employee', 'applications'] })
    queryClient.invalidateQueries({ queryKey: ['jobs'] })
  }

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-xl font-semibold text-slate-900">Discover roles matched to your skills</h2>
        <p className="text-sm text-slate-500">
          Filter by location, remote preference, and employment type to personalize suggestions.
        </p>
      </header>

      <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-4">
        <div className="md:col-span-2">
          <label className="text-xs font-medium uppercase tracking-wide text-slate-500" htmlFor="job-search">
            Search
          </label>
          <div className="mt-2 flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-2">
            <FiSearch className="text-slate-400" />
            <input
              id="job-search"
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Keywords, skills, company"
              className="flex-1 border-none bg-transparent text-sm text-slate-900 outline-none"
            />
          </div>
        </div>
        <div>
          <label className="text-xs font-medium uppercase tracking-wide text-slate-500" htmlFor="job-location">
            Location
          </label>
          <div className="mt-2 flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-2">
            <FiMapPin className="text-slate-400" />
            <input
              id="job-location"
              type="text"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              placeholder="City, country"
              className="flex-1 border-none bg-transparent text-sm text-slate-900 outline-none"
            />
          </div>
        </div>
        <div>
          <label className="text-xs font-medium uppercase tracking-wide text-slate-500" htmlFor="employmentType">
            Employment type
          </label>
          <div className="mt-2 flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-2 text-sm">
            <FiBriefcase className="text-slate-400" />
            <select
              id="employmentType"
              value={employmentType}
              onChange={(event) => setEmploymentType(event.target.value)}
              className="flex-1 border-none bg-transparent text-sm text-slate-900 outline-none"
            >
              {employmentTypes.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <label className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-600">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            checked={remoteOnly}
            onChange={(event) => setRemoteOnly(event.target.checked)}
          />
          Remote-friendly only
        </label>
      </div>

      <button
        type="button"
        onClick={() => query.refetch()}
        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-indigo-200 hover:text-indigo-600"
      >
        <FiSliders />
        Apply filters
      </button>

      {query.isLoading ? (
        <div className="flex justify-center py-10">
          <Spinner loading />
        </div>
      ) : query.isError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-700">
          {query.error?.message ?? 'Failed to load jobs'}
        </div>
      ) : jobs.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-500">
          No jobs matched your filters. Adjust your search to discover more opportunities.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {jobs.map((job) => (
            <article key={job.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    <Link to={`/jobs/${job.id}`} className="hover:underline">{job.title}</Link>
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">{job.location}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleFavorite(job.id)}
                    className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 hover:border-indigo-200 hover:text-indigo-600"
                  >
                    <FiBookmark />
                    Save
                  </button>
                  {user?.role === 'employee' && job.status === 'published' ? (
                    <>
                      <button
                        type="button"
                        onClick={() => handleApply(job.id)}
                        className="inline-flex items-center gap-1 rounded-full bg-indigo-600 px-3 py-1 text-xs font-medium text-white hover:bg-indigo-500"
                      >
                        Apply
                      </button>
                    </>
                  ) : null}
                </div>
              </div>
              <p className="mt-3 text-sm text-slate-600 line-clamp-3">{job.summary ?? job.description}</p>
              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span className="rounded-full bg-slate-100 px-3 py-1 font-medium">
                  {job.employmentType?.replace('_', ' ')}
                </span>
                {job.isRemote ? <span className="rounded-full bg-emerald-100 px-3 py-1 font-medium text-emerald-600">Remote</span> : null}
              </div>
            </article>
          ))}
        </div>
      )}

      {selectedJob ? (
        <QuickApplyModal
          job={jobs.find((j) => j.id === selectedJob) || { id: selectedJob, title: 'Job' }}
          open={Boolean(selectedJob)}
          onClose={() => setSelectedJob(null)}
          onApplied={handleModalApplied}
        />
      ) : null}
    </div>
  );
};

export default EmployeeJobs;
