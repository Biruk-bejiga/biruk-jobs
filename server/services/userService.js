import { and, eq } from 'drizzle-orm';
import { getDb } from '../db/index.js';
import {
  employeeProfiles,
  employerProfiles,
  jobApplications,
  jobs,
  users,
  userRoleEnum,
} from '../db/schema.js';

export async function getUserByEmail(email) {
  const db = getDb();
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return user ?? null;
}

export async function getUserById(userId) {
  const db = getDb();
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  return user ?? null;
}

export async function createUser({
  email,
  passwordHash,
  role,
  fullName,
  phone,
  avatarUrl,
  location,
  employerProfile,
  employeeProfile,
}) {
  const db = getDb();

  if (!userRoleEnum.enumValues.includes(role)) {
    throw new Error(`Unsupported role: ${role}`);
  }

  return db.transaction(async (tx) => {
    const [user] = await tx
      .insert(users)
      .values({
        email,
        passwordHash,
        role,
        fullName,
        phone,
        avatarUrl,
        location,
      })
      .returning();

    if (role === 'employer' && employerProfile) {
      await tx
        .insert(employerProfiles)
        .values({
          userId: user.id,
          companyName: employerProfile.companyName,
          companyWebsite: employerProfile.companyWebsite,
          companyDescription: employerProfile.companyDescription,
          companySize: employerProfile.companySize,
          industry: employerProfile.industry,
          headquarters: employerProfile.headquarters,
          foundedYear: employerProfile.foundedYear,
        })
        .onConflictDoNothing();
    }

    if (role === 'employee' && employeeProfile) {
      await tx
        .insert(employeeProfiles)
        .values({
          userId: user.id,
          headline: employeeProfile.headline,
          location: employeeProfile.location,
          yearsExperience: employeeProfile.yearsExperience,
          resumeUrl: employeeProfile.resumeUrl,
          portfolioUrl: employeeProfile.portfolioUrl,
          bio: employeeProfile.bio,
        })
        .onConflictDoNothing();
    }

    return user;
  });
}

export async function updateUserLastLogin(userId) {
  const db = getDb();
  await db
    .update(users)
    .set({ lastLoginAt: new Date() })
    .where(eq(users.id, userId));
}

export async function listUsers({ role, isActive = true } = {}) {
  const db = getDb();
  let query = db.select().from(users);
  if (role) {
    query = query.where(and(eq(users.role, role), eq(users.isActive, isActive)));
  } else if (typeof isActive === 'boolean') {
    query = query.where(eq(users.isActive, isActive));
  }
  return query;
}

export async function setUserActiveStatus(userId, isActive) {
  const db = getDb();
  await db.update(users).set({ isActive }).where(eq(users.id, userId));
}

export async function updateUserProfile(userId, updates) {
  const db = getDb();
  const patch = {};
  if (typeof updates.fullName === 'string') {
    patch.fullName = updates.fullName;
  }
  if (typeof updates.phone === 'string' || updates.phone === null) {
    patch.phone = updates.phone;
  }
  if (typeof updates.location === 'string' || updates.location === null) {
    patch.location = updates.location;
  }
  if (typeof updates.avatarUrl === 'string' || updates.avatarUrl === null) {
    patch.avatarUrl = updates.avatarUrl;
  }

  if (!Object.keys(patch).length) {
    return getUserById(userId);
  }

  const [user] = await db
    .update(users)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(users.id, userId))
    .returning();
  return user ?? null;
}

export async function deleteUser(userId) {
  const db = getDb();
  await db.delete(users).where(eq(users.id, userId));
}

export async function getEmployerJobs(userId) {
  const db = getDb();
  return db.select().from(jobs).where(eq(jobs.employerId, userId));
}

export async function getEmployeeApplications(userId) {
  const db = getDb();
  return db
    .select()
    .from(jobApplications)
    .where(eq(jobApplications.applicantId, userId));
}
