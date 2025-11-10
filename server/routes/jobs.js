import { Router } from 'express';
import createHttpError from 'http-errors';
import { z } from 'zod';
import { authenticate, authorizeRoles } from '../middleware/auth.js';
import { verifyAccessToken } from '../lib/jwt.js';
import { getUserById } from '../services/userService.js';
import {
  applyToJob,
  createJob,
  deleteJob,
  getJobById,
  listApplicationsForJob,
  listJobs,
  updateJob,
} from '../services/jobService.js';

const router = Router();

const jobPayloadSchema = z.object({
  title: z.string().min(4),
  summary: z.string().optional(),
  description: z.string().min(10),
  responsibilities: z.string().optional(),
  requirements: z.string().optional(),
  location: z.string().min(2),
  isRemote: z.boolean().optional(),
  employmentType: z.enum(['full_time', 'part_time', 'contract', 'temporary', 'internship']),
  salaryMin: z.number().nonnegative().optional(),
  salaryMax: z.number().nonnegative().optional(),
  salaryCurrency: z.string().length(3).optional(),
  status: z.enum(['draft', 'published', 'closed']).optional(),
  publishedAt: z.string().datetime().optional(),
  closingDate: z.string().datetime().optional(),
});

const applicationSchema = z.object({
  coverLetter: z.string().optional(),
  resumeUrl: z.string().url().optional(),
});

async function getRequester(req) {
  const header = req.get('Authorization');
  const token = header?.startsWith('Bearer ')
    ? header.slice('Bearer '.length)
    : null;

  if (!token) {
    return null;
  }

  try {
    const payload = verifyAccessToken(token);
    const user = await getUserById(payload.sub);
    if (!user || !user.isActive) {
      return null;
    }

    return {
      id: user.id,
      role: user.role,
    };
  } catch (error) {
    console.error('Failed to authenticate optional user for job request', error);
    return null;
  }
}

const listQuerySchema = z.object({
  status: z.enum(['draft', 'published', 'closed']).optional(),
  search: z.string().max(255).optional(),
  location: z.string().max(255).optional(),
  employmentType: z.enum(['full_time', 'part_time', 'contract', 'temporary', 'internship']).optional(),
  employmentTypes: z.preprocess((value) => {
    if (Array.isArray(value)) {
      return value;
    }
    if (typeof value === 'string' && value.trim().length) {
      return value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
    }
    return undefined;
  }, z.array(z.enum(['full_time', 'part_time', 'contract', 'temporary', 'internship']))).optional(),
  isRemote: z
    .preprocess((value) => {
      if (typeof value === 'boolean') return value;
      if (typeof value === 'string') {
        if (value === 'true') return true;
        if (value === 'false') return false;
      }
      return undefined;
    }, z.boolean())
    .optional(),
  salaryMin: z
    .preprocess((value) => (value === undefined ? undefined : Number(value)), z.number().nonnegative())
    .optional(),
  salaryMax: z
    .preprocess((value) => (value === undefined ? undefined : Number(value)), z.number().nonnegative())
    .optional(),
});

router.get('/', async (req, res, next) => {
  try {
    const filters = listQuerySchema.parse(req.query);
    const jobsList = await listJobs(filters);
    res.json({ data: jobsList });
  } catch (err) {
    next(err);
  }
});

router.get('/:jobId', async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const job = await getJobById(jobId);
    if (!job) {
      throw createHttpError(404, 'Job not found');
    }

    const requester = await getRequester(req);
    const isOwner = requester?.role === 'employer' && requester.id === job.employerId;
    const isAdmin = requester?.role === 'admin';
    const isVisible = job.status === 'published' || isOwner || isAdmin;

    if (!isVisible) {
      throw createHttpError(404, 'Job not found');
    }

    res.json({ data: job });
  } catch (err) {
    next(err);
  }
});

router.post('/', authenticate, authorizeRoles('employer', 'admin'), async (req, res, next) => {
  try {
    const payload = jobPayloadSchema.parse(req.body);
    const job = await createJob({
      employerId: req.user.id,
      ...payload,
      publishedAt: payload.publishedAt ? new Date(payload.publishedAt) : undefined,
      closingDate: payload.closingDate ? new Date(payload.closingDate) : undefined,
    });
    res.status(201).json({ data: job });
  } catch (err) {
    next(err);
  }
});

router.put('/:jobId', authenticate, authorizeRoles('employer', 'admin'), async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const payload = jobPayloadSchema.partial().parse(req.body);

    const job = await getJobById(jobId);
    if (!job) {
      throw createHttpError(404, 'Job not found');
    }

    if (req.user.role === 'employer' && job.employerId !== req.user.id) {
      throw createHttpError(403, 'Cannot modify other employers\' jobs');
    }

    const updated = await updateJob(jobId, {
      ...payload,
      publishedAt: payload.publishedAt ? new Date(payload.publishedAt) : undefined,
      closingDate: payload.closingDate ? new Date(payload.closingDate) : undefined,
    });

    res.json({ data: updated });
  } catch (err) {
    next(err);
  }
});

router.delete('/:jobId', authenticate, authorizeRoles('employer', 'admin'), async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const job = await getJobById(jobId);
    if (!job) {
      throw createHttpError(404, 'Job not found');
    }
    if (req.user.role === 'employer' && job.employerId !== req.user.id) {
      throw createHttpError(403, 'Cannot delete other employers\' jobs');
    }

    await deleteJob(jobId);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

router.post('/:jobId/apply', authenticate, authorizeRoles('employee'), async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const payload = applicationSchema.parse(req.body);

    const job = await getJobById(jobId);
    if (!job || job.status !== 'published') {
      throw createHttpError(400, 'Job not accepting applications');
    }

    const application = await applyToJob({
      jobId,
      applicantId: req.user.id,
      ...payload,
    });

    if (!application) {
      throw createHttpError(409, 'You have already applied to this job');
    }

    res.status(201).json({ data: application });
  } catch (err) {
    next(err);
  }
});

router.get('/:jobId/applications', authenticate, authorizeRoles('employer', 'admin'), async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const job = await getJobById(jobId);
    if (!job) {
      throw createHttpError(404, 'Job not found');
    }
    if (req.user.role === 'employer' && job.employerId !== req.user.id) {
      throw createHttpError(403, 'Cannot view other employers\' applications');
    }

    const applications = await listApplicationsForJob(jobId);
    res.json({ data: applications });
  } catch (err) {
    next(err);
  }
});

export default router;
