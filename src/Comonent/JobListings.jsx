import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
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
        const body = await res.json();
        const data = Array.isArray(body?.data) ? body.data : [];
        setJobs(isHome ? data.slice(0, 3) : data);
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Failed to fetch jobs', error);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();

    return () => {
      controller.abort();
    };
  }, [isHome]);
  return (
    <section className="bg-blue-50 px-4 py-10">
      <div className="container-xl lg:container m-auto">
        <h2 className="text-3xl font-bold text-indigo-500 mb-6 text-center">
          {isHome ? 'Recent jobs' : 'Browse jobs'}
        </h2>
          {loading ? <Spinner loading={loading}/> : (
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {jobs.map((job) => (
               <JobListing key={job.id} job={job}/>
             ))}
             </div>
          )
         }
          
          
        
      </div>
    </section>
  )
}

export default JobListings

JobListings.propTypes = {
  isHome: PropTypes.bool,
}