import PropTypes from 'prop-types';
import { useEffect, useMemo, useState } from 'react';
import JobListing from './JobListing';
import Spinner from './Spinner';

const JobListings = ({ isHome = false }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({ status: 'published' });
    const apiUrl = `/api/jobs?${params.toString()}`;

    const fetchJobs = async () => {
      try {
        setLoading(true);
        const res = await fetch(apiUrl, { signal: controller.signal });
        if (!res.ok) {
          throw new Error(`Failed to load jobs: ${res.status}`);
        }
        const body = await res.json();
        const data = Array.isArray(body?.data) ? body.data : [];
        setJobs(data);
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Failed to fetch jobs', error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
    return () => controller.abort();
  }, []);

  const visibleJobs = useMemo(() => {
    if (isHome) {
      return jobs.slice(0, 3);
    }
    return jobs;
  }, [isHome, jobs]);

  return (
    <section className="bg-blue-50 px-4 py-10">
      <div className="container-xl lg:container m-auto">
        <h2 className="text-3xl font-bold text-indigo-500 mb-6 text-center">
          {isHome ? 'Recent jobs' : 'Browse jobs'}
        </h2>
        {loading ? (
          <Spinner loading={loading} />
        ) : visibleJobs.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-500">
            No jobs available right now. Check back soon!
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {visibleJobs.map((job) => (
              <JobListing key={job.id} job={job} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

JobListings.propTypes = {
  isHome: PropTypes.bool,
};

export default JobListings;