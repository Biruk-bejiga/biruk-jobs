import { and, desc, eq, gte, ilike, inArray, isNull, lte, or } from 'drizzle-orm';
import { getDb } from '../db/index.js';
import {
  applicationStatusEnum,
  employeeProfiles,
  jobApplications,
  jobApplicationMessages,
  jobApplicationStatusHistory,
  jobFavorites,
  jobs,
  jobStatusEnum,
  users,
} from '../db/schema.js';
import { createSlug } from '../lib/slug.js';

function buildJobFilters({
  status,
  search,
  employerId,
  employmentType,
  employmentTypes,
  location,
  isRemote,
  salaryMin,
  salaryMax,
}) {
  const conditions = [];
  if (status) {
    conditions.push(eq(jobs.status, status));
  }
  if (employerId) {
    conditions.push(eq(jobs.employerId, employerId));
  }
  if (employmentType) {
    conditions.push(eq(jobs.employmentType, employmentType));
  }
  if (employmentTypes && employmentTypes.length) {
    conditions.push(inArray(jobs.employmentType, employmentTypes));
  }
  if (location) {
    const pattern = `%${location.trim().toLowerCase()}%`;
    conditions.push(ilike(jobs.location, pattern));
  }
  if (typeof isRemote === 'boolean') {
    conditions.push(eq(jobs.isRemote, isRemote));
  }
  if (typeof salaryMin === 'number') {
    conditions.push(or(isNull(jobs.salaryMax), gte(jobs.salaryMax, salaryMin)));
  }
  if (typeof salaryMax === 'number') {
    conditions.push(or(isNull(jobs.salaryMin), lte(jobs.salaryMin, salaryMax)));
  }
  if (search) {
    const pattern = `%${search.trim().toLowerCase()}%`;
    conditions.push(
      or(
        ilike(jobs.title, pattern),
        ilike(jobs.summary, pattern),
        ilike(jobs.location, pattern),
      ),
    );
  }
  return conditions;
}

export async function listJobs(filters = {}) {
  const db = getDb();
  const conditions = buildJobFilters(filters);
  let query = db.select().from(jobs);
  if (conditions.length) {
    query = query.where(and(...conditions));
  }
  query = query.orderBy(desc(jobs.createdAt));
  return query;
}

export async function getJobById(jobId) {
  const db = getDb();
  const [record] = await db.select().from(jobs).where(eq(jobs.id, jobId)).limit(1);
  return record ?? null;
}

export async function getJobBySlug(slug) {
  const db = getDb();
  const [record] = await db.select().from(jobs).where(eq(jobs.slug, slug)).limit(1);
  return record ?? null;
}

function generateJobSlug(title) {
  const base = createSlug(title);
  const randomSuffix = Math.random().toString(36).slice(2, 8);
  return `${base}-${randomSuffix}`;
}

export async function createJob({
  employerId,
  title,
  summary,
  description,
  responsibilities,
  requirements,
  location,
  isRemote,
  employmentType,
  salaryMin,
  salaryMax,
  salaryCurrency,
  status = 'draft',
  publishedAt,
  closingDate,
}) {
  const db = getDb();
  if (!jobStatusEnum.enumValues.includes(status)) {
    throw new Error(`Invalid job status: ${status}`);
  }
  const slug = generateJobSlug(title);
  const [record] = await db
    .insert(jobs)
    .values({
      employerId,
      title,
      summary,
      description,
      responsibilities,
      requirements,
      location,
      isRemote,
      employmentType,
      salaryMin,
      salaryMax,
      salaryCurrency,
      status,
      publishedAt,
      closingDate,
      slug,
    })
    .returning();
  return record;
}

export async function listEmployerJobs(employerId, filters = {}) {
  return listJobs({ ...filters, employerId });
}

export async function listEmployeeApplications(applicantId) {
  const db = getDb();
  return db
    .select({
      application: jobApplications,
      job: {
        id: jobs.id,
        title: jobs.title,
        slug: jobs.slug,
        status: jobs.status,
        location: jobs.location,
        employmentType: jobs.employmentType,
        isRemote: jobs.isRemote,
        salaryMin: jobs.salaryMin,
        salaryMax: jobs.salaryMax,
        salaryCurrency: jobs.salaryCurrency,
        createdAt: jobs.createdAt,
        publishedAt: jobs.publishedAt,
      },
    })
    .from(jobApplications)
    .innerJoin(jobs, eq(jobApplications.jobId, jobs.id))
    .where(eq(jobApplications.applicantId, applicantId))
    .orderBy(desc(jobApplications.submittedAt));
}

export async function withdrawApplication({ applicationId, actorId }) {
  const updated = await updateApplicationStatus({
    applicationId,
    status: 'withdrawn',
    actorId,
    note: 'Applicant withdrew the application.',
  });
  return updated;
}

export async function createApplicationMessage({ applicationId, authorId, message }) {
  const db = getDb();
  const [record] = await db
    .insert(jobApplicationMessages)
    .values({ applicationId, authorId, message })
    .returning();
  return record ?? null;
}

export async function listApplicationMessages(applicationId) {
  const db = getDb();
  return db
    .select({
      message: jobApplicationMessages,
      author: {
        id: users.id,
        fullName: users.fullName,
        role: users.role,
      },
    })
    .from(jobApplicationMessages)
    .innerJoin(users, eq(jobApplicationMessages.authorId, users.id))
    .where(eq(jobApplicationMessages.applicationId, applicationId))
    .orderBy(desc(jobApplicationMessages.createdAt));
}

export async function favoriteJob({ jobId, employeeId }) {
  const db = getDb();
  const [favorite] = await db
    .insert(jobFavorites)
    .values({ jobId, employeeId })
    .onConflictDoNothing()
    .returning();
  return favorite ?? null;
}

export async function unfavoriteJob({ jobId, employeeId }) {
  const db = getDb();
  await db
    .delete(jobFavorites)
    .where(and(eq(jobFavorites.jobId, jobId), eq(jobFavorites.employeeId, employeeId)));
}

export async function listFavoriteJobsForUser(employeeId) {
  const db = getDb();
  return db
    .select({
      favorite: jobFavorites,
      job: {
        id: jobs.id,
        title: jobs.title,
        slug: jobs.slug,
        location: jobs.location,
        employmentType: jobs.employmentType,
        isRemote: jobs.isRemote,
        summary: jobs.summary,
        salaryMin: jobs.salaryMin,
        salaryMax: jobs.salaryMax,
        salaryCurrency: jobs.salaryCurrency,
        status: jobs.status,
        publishedAt: jobs.publishedAt,
      },
    })
    .from(jobFavorites)
    .innerJoin(jobs, eq(jobFavorites.jobId, jobs.id))
    .where(eq(jobFavorites.employeeId, employeeId))
    .orderBy(desc(jobFavorites.createdAt));
}

export async function getApplicationWithJob(applicationId) {
  const db = getDb();
  const [record] = await db
    .select({
      application: jobApplications,
      job: {
        id: jobs.id,
        employerId: jobs.employerId,
        title: jobs.title,
        status: jobs.status,
      },
    })
    .from(jobApplications)
    .innerJoin(jobs, eq(jobApplications.jobId, jobs.id))
    .where(eq(jobApplications.id, applicationId))
    .limit(1);
  return record ?? null;
}

export async function getApplicationStatusHistory(applicationId) {
  const db = getDb();
  return db
    .select({
      history: jobApplicationStatusHistory,
      actor: {
        id: users.id,
        fullName: users.fullName,
        role: users.role,
      },
    })
    .from(jobApplicationStatusHistory)
    .leftJoin(users, eq(jobApplicationStatusHistory.changedById, users.id))
    .where(eq(jobApplicationStatusHistory.applicationId, applicationId))
    .orderBy(desc(jobApplicationStatusHistory.createdAt));
}

export async function updateJob(jobId, updates) {
  const db = getDb();
  if (updates.status && !jobStatusEnum.enumValues.includes(updates.status)) {
    throw new Error(`Invalid job status: ${updates.status}`);
  }
  const [record] = await db
    .update(jobs)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(jobs.id, jobId))
    .returning();
  return record ?? null;
}

export async function deleteJob(jobId) {
  const db = getDb();
  await db.delete(jobs).where(eq(jobs.id, jobId));
}

export async function applyToJob({ jobId, applicantId, coverLetter, resumeUrl }) {
  const db = getDb();
  const [application] = await db
    .insert(jobApplications)
    .values({
      jobId,
      applicantId,
      coverLetter,
      resumeUrl,
      status: 'submitted',
    })
    .onConflictDoNothing()
    .returning();
  if (!application) {
    return null;
  }

  await db.insert(jobApplicationStatusHistory).values({
    applicationId: application.id,
    status: application.status,
    changedById: applicantId,
  });

  return application;
}

export async function listApplicationsForJob(jobId) {
  const db = getDb();
  return db
    .select({
      application: jobApplications,
      applicant: {
        id: users.id,
        email: users.email,
        fullName: users.fullName,
        avatarUrl: users.avatarUrl,
      },
      profile: {
        headline: employeeProfiles.headline,
        location: employeeProfiles.location,
        yearsExperience: employeeProfiles.yearsExperience,
        resumeUrl: employeeProfiles.resumeUrl,
        portfolioUrl: employeeProfiles.portfolioUrl,
      },
    })
    .from(jobApplications)
    .innerJoin(users, eq(jobApplications.applicantId, users.id))
    .leftJoin(employeeProfiles, eq(users.id, employeeProfiles.userId))
    .where(eq(jobApplications.jobId, jobId))
    .orderBy(desc(jobApplications.submittedAt));
}

export async function updateApplicationStatus({ applicationId, status, actorId, note }) {
  const db = getDb();
  if (!applicationStatusEnum.enumValues.includes(status)) {
    throw new Error(`Invalid application status: ${status}`);
  }
  const [record] = await db
    .update(jobApplications)
    .set({ status, updatedAt: new Date() })
    .where(eq(jobApplications.id, applicationId))
    .returning();
  if (!record) {
    return null;
  }

  await db.insert(jobApplicationStatusHistory).values({
    applicationId,
    status,
    changedById: actorId ?? null,
    note,
  });

  return record;
}
