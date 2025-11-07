import { Router } from 'express';
import createHttpError from 'http-errors';
import { z } from 'zod';
import { authenticate, authorizeRoles } from '../middleware/auth.js';
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

router.get('/', async (req, res, next) => {
  try {
    const jobsList = await listJobs({
      status: req.query.status,
      search: req.query.search,
    });
    res.json({ data: jobsList });
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
