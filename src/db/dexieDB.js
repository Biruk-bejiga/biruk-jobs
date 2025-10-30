import Dexie from "dexie";

const db = new Dexie("BirukJobsDB");

// jobs table: auto-increment id, index on title/type/location for simple queries
db.version(1).stores({
  jobs: "++id, title, type, location, salary"
});

export async function getAllJobs() {
  return await db.jobs.toArray();
}

export async function getJob(id) {
  return await db.jobs.get(id);
}

export async function addJob(job) {
  // If job includes an id, keep it (coerce to number); otherwise Dexie will auto-generate ++id
  const jobToInsert = { ...job };
  if (jobToInsert.id) {
    jobToInsert.id = Number(jobToInsert.id);
  }
  const id = await db.jobs.add(jobToInsert);
  return db.jobs.get(id);
}

export async function updateJob(id, updates) {
  await db.jobs.update(id, updates);
  return db.jobs.get(id);
}

export async function deleteJob(id) {
  await db.jobs.delete(id);
}

export async function clearAllJobs() {
  await db.jobs.clear();
}

export async function countJobs() {
  return await db.jobs.count();
}

export async function seedIfEmpty(defaultJobs = []) {
  const c = await db.jobs.count();
  if (c === 0 && Array.isArray(defaultJobs) && defaultJobs.length > 0) {
    // Prepare jobs: coerce id to number if present
    const prepared = defaultJobs.map((j) => {
      const copy = { ...j };
      if (copy.id) copy.id = Number(copy.id);
      else delete copy.id;
      return copy;
    });
    try {
      await db.jobs.bulkAdd(prepared);
    } catch (err) {
      // If bulkAdd fails (e.g., duplicate keys), fallback to add
      for (const job of prepared) {
        try {
          await db.jobs.add(job);
        } catch (e) {
          // ignore duplicates
        }
      }
    }
  }
}

export default db;
