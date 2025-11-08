// src/hooks/useJobs.js — migrated to Dexie (IndexedDB)
import { useEffect, useState } from "react";
import {
  getAllJobs,
  addJob as addJobDb,
  updateJob as updateJobDb,
  deleteJob as deleteJobDb,
  seedIfEmpty,
} from "../db/dexieDB";
import jobsJson from "../jobs.json";

export const useJobs = () => {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    let mounted = true;

    (async () => {
      // Seed DB from static jobs.json on first run (only if empty)
      try {
        await seedIfEmpty(jobsJson.jobs || []);
      } catch (err) {
        // seeding failed — continue, we'll still try to read whatever exists
        console.error("Error seeding DB:", err);
      }

      try {
        const all = await getAllJobs();
        if (mounted) setJobs(all);
      } catch (err) {
        console.error("Failed to load jobs from IndexedDB:", err);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const addJob = async (newJob) => {
    const jobToAdd = { ...newJob };
    const added = await addJobDb(jobToAdd);
    setJobs((prev) => [...prev, added]);
    return added;
  };

  const updateJob = async (id, updates) => {
    const updated = await updateJobDb(id, updates);
    setJobs((prev) => prev.map((j) => (j.id === id ? updated : j)));
    return updated;
  };

  const deleteJob = async (id) => {
    await deleteJobDb(id);
    setJobs((prev) => prev.filter((j) => j.id !== id));
  };

  const refresh = async () => {
    const all = await getAllJobs();
    setJobs(all);
  };

  return { jobs, addJob, updateJob, deleteJob, refresh };
};
