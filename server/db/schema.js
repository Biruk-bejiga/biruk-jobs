import { relations } from 'drizzle-orm';
import {
  boolean,
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

export const userRoleEnum = pgEnum('user_role', ['employer', 'employee', 'admin']);
export const employmentTypeEnum = pgEnum('employment_type', [
  'full_time',
  'part_time',
  'contract',
  'temporary',
  'internship',
]);
export const jobStatusEnum = pgEnum('job_status', ['draft', 'published', 'closed']);
export const applicationStatusEnum = pgEnum('application_status', [
  'submitted',
  'in_review',
  'shortlisted',
  'rejected',
  'withdrawn',
  'hired',
]);

export const users = pgTable(
  'users',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    email: varchar('email', { length: 255 }).notNull(),
    passwordHash: varchar('password_hash', { length: 255 }).notNull(),
    role: userRoleEnum('role').notNull(),
    fullName: varchar('full_name', { length: 255 }).notNull(),
    phone: varchar('phone', { length: 50 }),
    avatarUrl: varchar('avatar_url', { length: 512 }),
  location: varchar('location', { length: 255 }),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    lastLoginAt: timestamp('last_login_at'),
  },
  (table) => ({
    emailIdx: uniqueIndex('users_email_idx').on(table.email),
  }),
);

export const employerProfiles = pgTable(
  'employer_profiles',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    companyName: varchar('company_name', { length: 255 }).notNull(),
    companyWebsite: varchar('company_website', { length: 255 }),
    companyDescription: text('company_description'),
    companySize: varchar('company_size', { length: 64 }),
    industry: varchar('industry', { length: 120 }),
    headquarters: varchar('headquarters', { length: 255 }),
    foundedYear: integer('founded_year'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    employerUserIdx: uniqueIndex('employer_profiles_user_idx').on(table.userId),
  }),
);

export const employeeProfiles = pgTable(
  'employee_profiles',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    headline: varchar('headline', { length: 255 }),
    location: varchar('location', { length: 255 }),
    yearsExperience: integer('years_experience'),
    resumeUrl: varchar('resume_url', { length: 512 }),
    portfolioUrl: varchar('portfolio_url', { length: 512 }),
    bio: text('bio'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    employeeUserIdx: uniqueIndex('employee_profiles_user_idx').on(table.userId),
  }),
);

export const jobs = pgTable(
  'jobs',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    employerId: uuid('employer_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    title: varchar('title', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 255 }).notNull(),
    summary: varchar('summary', { length: 512 }),
    description: text('description').notNull(),
    responsibilities: text('responsibilities'),
    requirements: text('requirements'),
    location: varchar('location', { length: 255 }).notNull(),
    isRemote: boolean('is_remote').default(false).notNull(),
    employmentType: employmentTypeEnum('employment_type').notNull(),
    salaryMin: numeric('salary_min', { precision: 12, scale: 2 }),
    salaryMax: numeric('salary_max', { precision: 12, scale: 2 }),
    salaryCurrency: varchar('salary_currency', { length: 8 }).default('USD'),
    status: jobStatusEnum('status').default('draft').notNull(),
    publishedAt: timestamp('published_at'),
    closingDate: timestamp('closing_date'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    slugIdx: uniqueIndex('jobs_slug_idx').on(table.slug),
  }),
);

export const jobApplications = pgTable(
  'job_applications',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    jobId: uuid('job_id')
      .notNull()
      .references(() => jobs.id, { onDelete: 'cascade' }),
    applicantId: uuid('applicant_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    coverLetter: text('cover_letter'),
    resumeUrl: varchar('resume_url', { length: 512 }),
    status: applicationStatusEnum('status').default('submitted').notNull(),
    submittedAt: timestamp('submitted_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    archivedAt: timestamp('archived_at'),
  },
  (table) => ({
    applicantJobIdx: uniqueIndex('job_applications_unique_idx').on(table.jobId, table.applicantId),
  }),
);

export const jobApplicationMessages = pgTable('job_application_messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  applicationId: uuid('application_id')
    .notNull()
    .references(() => jobApplications.id, { onDelete: 'cascade' }),
  authorId: uuid('author_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  message: text('message').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const refreshTokens = pgTable(
  'refresh_tokens',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    tokenHash: varchar('token_hash', { length: 255 }).notNull(),
    userAgent: varchar('user_agent', { length: 255 }),
    ipAddress: varchar('ip_address', { length: 64 }),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    revokedAt: timestamp('revoked_at'),
  },
  (table) => ({
    userTokenIdx: uniqueIndex('refresh_tokens_user_token_idx').on(table.userId, table.tokenHash),
  }),
);

export const userRelations = relations(users, ({ one, many }) => ({
  employerProfile: one(employerProfiles, {
    fields: [users.id],
    references: [employerProfiles.userId],
  }),
  employeeProfile: one(employeeProfiles, {
    fields: [users.id],
    references: [employeeProfiles.userId],
  }),
  jobs: many(jobs),
  applications: many(jobApplications),
  refreshTokens: many(refreshTokens),
  messages: many(jobApplicationMessages),
}));

export const employerRelations = relations(employerProfiles, ({ one, many }) => ({
  user: one(users, {
    fields: [employerProfiles.userId],
    references: [users.id],
  }),
  jobs: many(jobs, {
    relationName: 'employerJobs',
  }),
}));

export const employeeRelations = relations(employeeProfiles, ({ one, many }) => ({
  user: one(users, {
    fields: [employeeProfiles.userId],
    references: [users.id],
  }),
  applications: many(jobApplications),
}));

export const jobRelations = relations(jobs, ({ one, many }) => ({
  employer: one(users, {
    fields: [jobs.employerId],
    references: [users.id],
  }),
  applications: many(jobApplications),
}));

export const jobApplicationRelations = relations(jobApplications, ({ one, many }) => ({
  job: one(jobs, {
    fields: [jobApplications.jobId],
    references: [jobs.id],
  }),
  applicant: one(users, {
    fields: [jobApplications.applicantId],
    references: [users.id],
  }),
  messages: many(jobApplicationMessages),
}));

export const jobApplicationMessageRelations = relations(jobApplicationMessages, ({ one }) => ({
  application: one(jobApplications, {
    fields: [jobApplicationMessages.applicationId],
    references: [jobApplications.id],
  }),
  author: one(users, {
    fields: [jobApplicationMessages.authorId],
    references: [users.id],
  }),
}));
