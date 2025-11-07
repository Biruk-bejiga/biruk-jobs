import { and, desc, eq, ilike, or } from 'drizzle-orm';
import { getDb } from '../db/index.js';
import {
  applicationStatusEnum,
  jobApplications,
  jobs,
  jobStatusEnum,
} from '../db/schema.js';
import { createSlug } from '../lib/slug.js';

function buildJobFilters({ status, search, employerId }) {
  const conditions = [];
  if (status) {
    conditions.push(eq(jobs.status, status));
  }
  if (employerId) {
    conditions.push(eq(jobs.employerId, employerId));
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
  return application ?? null;
}

export async function listApplicationsForJob(jobId) {
  const db = getDb();
  return db.select().from(jobApplications).where(eq(jobApplications.jobId, jobId));
}

export async function updateApplicationStatus({ applicationId, status }) {
  const db = getDb();
  if (!applicationStatusEnum.enumValues.includes(status)) {
    throw new Error(`Invalid application status: ${status}`);
  }
  const [record] = await db
    .update(jobApplications)
    .set({ status, updatedAt: new Date() })
    .where(eq(jobApplications.id, applicationId))
    .returning();
  return record ?? null;
}
