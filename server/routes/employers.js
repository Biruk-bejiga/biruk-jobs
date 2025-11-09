import { Router } from 'express';
import createHttpError from 'http-errors';
import { z } from 'zod';
import { authenticate, authorizeRoles } from '../middleware/auth.js';
import {
  createApplicationMessage,
  getApplicationStatusHistory,
  getApplicationWithJob,
  getJobById,
  listApplicationMessages,
  listApplicationsForJob,
  listEmployerJobs,
  updateApplicationStatus,
} from '../services/jobService.js';
import { getEmployerJobs, getEmployerProfile, updateEmployerProfile } from '../services/userService.js';

const router = Router();

const profileSchema = z
  .object({
    fullName: z.string().min(3).max(255).optional(),
    phone: z.string().min(6).max(30).nullable().optional(),
    location: z.string().max(255).nullable().optional(),
    companyName: z.string().min(2).max(255).optional(),
    companyWebsite: z.string().url().max(255).nullable().optional(),
    companyDescription: z.string().nullable().optional(),
    companySize: z.string().max(64).nullable().optional(),
    industry: z.string().max(120).nullable().optional(),
    headquarters: z.string().max(255).nullable().optional(),
    foundedYear: z.number().int().min(1800).max(new Date().getFullYear()).nullable().optional(),
  })
  .partial();

const jobFiltersSchema = z.object({
  status: z.enum(['draft', 'published', 'closed']).optional(),
  search: z.string().max(255).optional(),
});

const applicationStatusSchema = z.object({
  status: z.enum(['submitted', 'in_review', 'shortlisted', 'rejected', 'withdrawn', 'hired']),
  note: z.string().max(500).optional(),
});

const messageSchema = z.object({
  message: z.string().min(1).max(2000),
});

router.use(authenticate, authorizeRoles('employer'));

router.get('/me', async (req, res, next) => {
  try {
    const profile = await getEmployerProfile(req.user.id);
    if (!profile) {
      throw createHttpError(404, 'Employer profile not found');
    }

    const jobs = await getEmployerJobs(req.user.id);
    const stats = {
      totalJobs: jobs.length,
      publishedJobs: jobs.filter((job) => job.status === 'published').length,
      draftJobs: jobs.filter((job) => job.status === 'draft').length,
      closedJobs: jobs.filter((job) => job.status === 'closed').length,
    };

    res.json({
      data: {
        profile,
        stats,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.put('/me', async (req, res, next) => {
  try {
    const payload = profileSchema.parse(req.body);
    const updated = await updateEmployerProfile(req.user.id, payload);
    res.json({ data: updated });
  } catch (err) {
    next(err);
  }
});

router.get('/jobs', async (req, res, next) => {
  try {
    const filters = jobFiltersSchema.parse(req.query);
    const jobs = await listEmployerJobs(req.user.id, filters);
    res.json({ data: jobs });
  } catch (err) {
    next(err);
  }
});

router.get('/jobs/:jobId/applications', async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const job = await getJobById(jobId);
    if (!job) {
      throw createHttpError(404, 'Job not found');
    }
    if (job.employerId !== req.user.id) {
      throw createHttpError(403, 'Cannot view applications for another employer\'s job');
    }

    const applications = await listApplicationsForJob(jobId);
    res.json({ data: applications });
  } catch (err) {
    next(err);
  }
});

router.patch('/applications/:applicationId/status', async (req, res, next) => {
  try {
    const { applicationId } = req.params;
    const payload = applicationStatusSchema.parse(req.body);
    if (payload.status === 'submitted') {
      throw createHttpError(400, 'Cannot revert application to submitted');
    }

    const application = await getApplicationWithJob(applicationId);
    if (!application) {
      throw createHttpError(404, 'Application not found');
    }

    if (application.job.employerId !== req.user.id) {
      throw createHttpError(403, 'Cannot update applications for another employer\'s job');
    }

    const updated = await updateApplicationStatus({
      applicationId,
      status: payload.status,
      actorId: req.user.id,
      note: payload.note,
    });

    const history = await getApplicationStatusHistory(applicationId);

    res.json({
      data: {
        application: updated,
        history,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.get('/applications/:applicationId/history', async (req, res, next) => {
  try {
    const { applicationId } = req.params;
    const application = await getApplicationWithJob(applicationId);
    if (!application) {
      throw createHttpError(404, 'Application not found');
    }
    if (application.job.employerId !== req.user.id) {
      throw createHttpError(403, 'Cannot view history for another employer\'s job');
    }
    const history = await getApplicationStatusHistory(applicationId);
    res.json({ data: history });
  } catch (err) {
    next(err);
  }
});

router.post('/applications/:applicationId/messages', async (req, res, next) => {
  try {
    const { applicationId } = req.params;
    const payload = messageSchema.parse(req.body);
    const application = await getApplicationWithJob(applicationId);
    if (!application) {
      throw createHttpError(404, 'Application not found');
    }
    if (application.job.employerId !== req.user.id) {
      throw createHttpError(403, 'Cannot message applicants for another employer\'s job');
    }
    const message = await createApplicationMessage({
      applicationId,
      authorId: req.user.id,
      message: payload.message,
    });
    res.status(201).json({ data: message });
  } catch (err) {
    next(err);
  }
});

router.get('/applications/:applicationId/messages', async (req, res, next) => {
  try {
    const { applicationId } = req.params;
    const application = await getApplicationWithJob(applicationId);
    if (!application) {
      throw createHttpError(404, 'Application not found');
    }
    if (application.job.employerId !== req.user.id) {
      throw createHttpError(403, 'Cannot view messages for another employer\'s job');
    }
    const messages = await listApplicationMessages(applicationId);
    res.json({ data: messages });
  } catch (err) {
    next(err);
  }
});

export default router;
