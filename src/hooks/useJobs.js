import { useContext } from 'react';
import { JobsContext } from '../context/JobsContext.jsx';

export const useJobs = () => {
  const ctx = useContext(JobsContext);
  if (!ctx) {
    throw new Error('useJobs must be used within a JobsProvider');
  }
  return ctx;
};
