import PropTypes from 'prop-types';
import { useMemo } from 'react';
import JobListing from './JobListing';
import Spinner from './Spinner';
import { useJobs } from '../hooks/useJobs.js';

const JobListings = ({ isHome = false }) => {
  const { jobs, isLoading } = useJobs();

  const displayedJobs = useMemo(() => {
    if (!Array.isArray(jobs)) return [];
    const sorted = [...jobs].sort(
      (a, b) => (b?.createdAt ?? 0) - (a?.createdAt ?? 0),
    );
    return isHome ? sorted.slice(0, 3) : sorted;
  }, [jobs, isHome]);
  return (
    <section className="bg-blue-50 px-4 py-10">
      <div className="container-xl lg:container m-auto">
        <h2 className="text-3xl font-bold text-indigo-500 mb-6 text-center">
          {isHome ? 'Recent jobs' : 'Browse jobs'}
        </h2>
       {isLoading ? <Spinner loading={isLoading}/> : (
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           {displayedJobs.map((job) => (
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
};