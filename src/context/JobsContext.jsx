import PropTypes from 'prop-types';
import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import defaultJobs from '../data/jobs.json';

const STORAGE_KEY = 'biruk_jobs_list';

export const JobsContext = createContext(null);

const ensureCompany = (company = {}) => ({
  name: company.name ?? '',
  description: company.description ?? '',
  contactEmail: company.contactEmail ?? '',
  contactPhone: company.contactPhone ?? '',
});

const sanitiseJob = (job, fallbackCreatedAt = Date.now()) => {
  const id = (job.id ?? fallbackCreatedAt.toString()).toString();
  return {
    ...job,
    id,
    company: ensureCompany(job.company),
    createdAt: job.createdAt ?? fallbackCreatedAt,
  };
};

const sanitiseList = (jobs) =>
  jobs.map((job, index) => sanitiseJob(job, Date.now() + index));

const readFromStorage = () => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch (error) {
    console.error('Failed to read jobs from storage', error);
    return null;
  }
};

const writeToStorage = (jobs) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
  } catch (error) {
    console.error('Failed to persist jobs to storage', error);
  }
};

export const JobsProvider = ({ children }) => {
  const [jobs, setJobs] = useState(() => []);
  const [isInitialised, setIsInitialised] = useState(false);

  useEffect(() => {
    const stored = readFromStorage();
    if (stored && stored.length > 0) {
      setJobs(sanitiseList(stored));
      setIsInitialised(true);
      return;
    }

    const initialJobs = sanitiseList(defaultJobs);
    setJobs(initialJobs);
    writeToStorage(initialJobs);
    setIsInitialised(true);
  }, []);

  useEffect(() => {
    if (isInitialised) {
      writeToStorage(jobs);
    }
  }, [jobs, isInitialised]);

  const addJob = useCallback((job) => {
    const newJob = {
      id: (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString()),
      ...job,
      createdAt: Date.now(),
      company: ensureCompany(job.company),
    };
    setJobs((prev) => [newJob, ...prev]);
    return newJob;
  }, []);

  const updateJob = useCallback((id, updates) => {
    setJobs((prev) =>
      prev.map((job) => {
        if (job.id !== id) return job;
        const company = ensureCompany(updates.company ?? job.company);
        return {
          ...job,
          ...updates,
          id: job.id,
          createdAt: job.createdAt,
          company,
        };
      }),
    );
  }, []);

  const deleteJob = useCallback((id) => {
    setJobs((prev) => prev.filter((job) => job.id !== id));
  }, []);

  const getJobById = useCallback((id) => jobs.find((job) => job.id === id), [jobs]);

  const value = useMemo(
    () => ({
      jobs,
      isLoading: !isInitialised,
      addJob,
      updateJob,
      deleteJob,
      getJobById,
    }),
    [jobs, isInitialised, addJob, updateJob, deleteJob, getJobById],
  );

  return <JobsContext.Provider value={value}>{children}</JobsContext.Provider>;
};

JobsProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
