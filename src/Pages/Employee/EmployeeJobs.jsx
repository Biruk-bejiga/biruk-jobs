import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { FiBookmark, FiBriefcase, FiMapPin, FiSearch, FiSliders } from 'react-icons/fi';
import Spinner from '../../Comonent/Spinner';
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
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [employmentType, setEmploymentType] = useState('');
  const [remoteOnly, setRemoteOnly] = useState(false);

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
    navigate(`/employee/jobs/${jobId}`);
  };

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-xl font-semibold text-slate-900">Discover roles matched to your skills</h2>
        <p className="text-sm text-slate-500">
          Filter by location, remote preference, and employment type to personalize suggestions.
        </p>
      </header>

      <div className="grid gap-4 rounded-2xl border border-slate-200 bg-slate p-5 shadow-sm md:grid-cols-4">
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
            className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            checked={remoteOnly}
            onChange={(event) => setRemoteOnly(event.target.checked)}
          />
          Remote-friendly only
        </label>
      </div>

      <button
        type="button"
        onClick={() => query.refetch()}
        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-emerald-200 hover:text-emerald-600"
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
        <div className="rounded-2xl border border-slate-200 bg-slate px-6 py-12 text-center text-sm text-slate-500">
          No jobs matched your filters. Adjust your search to discover more opportunities.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {jobs.map((job) => (
            <article key={job.id} className="rounded-2xl border border-slate-200 bg-slate p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{job.title}</h3>
                  <p className="mt-1 text-sm text-slate-500">{job.location}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleFavorite(job.id)}
                    className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 hover:border-emerald-200 hover:text-emerald-600"
                  >
                    <FiBookmark />
                    Save
                  </button>
                  
                </div>
              </div>
              <p className="mt-3 text-sm text-slate-600 line-clamp-3">{job.summary ?? job.description}</p>
              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span className="rounded-full bg-slate-100 px-3 py-1 font-medium">
                  {job.employmentType?.replace('_', ' ')}
                </span>
                {job.isRemote ? <span className="rounded-full bg-emerald-100 px-3 py-1 font-medium text-emerald-600">Remote</span> : null}
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => navigate(`/employee/jobs/${job.id}`)}
                  className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-slate transition hover:bg-emerald-500"
                >
                  View details
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmployeeJobs;
