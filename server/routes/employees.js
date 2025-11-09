import { Router } from 'express';
import createHttpError from 'http-errors';
import { z } from 'zod';
import { authenticate, authorizeRoles } from '../middleware/auth.js';
import {
  favoriteJob,
  getApplicationStatusHistory,
  getApplicationWithJob,
  createApplicationMessage,
  listApplicationMessages,
  listEmployeeApplications,
  listFavoriteJobsForUser,
  unfavoriteJob,
  withdrawApplication,
} from '../services/jobService.js';
import { getEmployeeProfile, updateEmployeeProfile } from '../services/userService.js';

const router = Router();

const profileSchema = z
  .object({
    fullName: z.string().min(3).max(255).optional(),
    phone: z.string().min(6).max(30).nullable().optional(),
    location: z.string().max(255).nullable().optional(),
    headline: z.string().max(255).nullable().optional(),
    yearsExperience: z.number().int().min(0).max(80).nullable().optional(),
    resumeUrl: z.string().url().max(512).nullable().optional(),
    portfolioUrl: z.string().url().max(512).nullable().optional(),
    bio: z.string().nullable().optional(),
  })
  .partial();

const favoriteSchema = z.object({
  jobId: z.string().uuid(),
});

const messageSchema = z.object({
  message: z.string().min(1).max(2000),
});

router.use(authenticate, authorizeRoles('employee'));

router.get('/me', async (req, res, next) => {
  try {
    const profile = await getEmployeeProfile(req.user.id);
    if (!profile) {
      throw createHttpError(404, 'Employee profile not found');
    }
    res.json({ data: profile });
  } catch (err) {
    next(err);
  }
});

router.put('/me', async (req, res, next) => {
  try {
    const payload = profileSchema.parse(req.body);
    const updated = await updateEmployeeProfile(req.user.id, payload);
    res.json({ data: updated });
  } catch (err) {
    next(err);
  }
});

router.get('/applications', async (req, res, next) => {
  try {
    const applications = await listEmployeeApplications(req.user.id);
    res.json({ data: applications });
  } catch (err) {
    next(err);
  }
});

router.post('/applications/:applicationId/withdraw', async (req, res, next) => {
  try {
    const { applicationId } = req.params;
    const application = await getApplicationWithJob(applicationId);
    if (!application) {
      throw createHttpError(404, 'Application not found');
    }
    if (application.application.applicantId !== req.user.id) {
      throw createHttpError(403, 'Cannot withdraw someone else\'s application');
    }
    if (application.application.status === 'withdrawn') {
      return res.json({ data: application.application });
    }
    const updated = await withdrawApplication({ applicationId, actorId: req.user.id });
    const history = await getApplicationStatusHistory(applicationId);
    res.json({ data: { application: updated, history } });
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
    if (application.application.applicantId !== req.user.id) {
      throw createHttpError(403, 'Cannot view history for another applicant');
    }
    const history = await getApplicationStatusHistory(applicationId);
    res.json({ data: history });
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
    if (application.application.applicantId !== req.user.id) {
      throw createHttpError(403, 'Cannot view messages for another applicant');
    }
    const messages = await listApplicationMessages(applicationId);
    res.json({ data: messages });
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
    if (application.application.applicantId !== req.user.id) {
      throw createHttpError(403, 'Cannot send messages for another applicant');
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

router.post('/favorites', async (req, res, next) => {
  try {
    const payload = favoriteSchema.parse(req.body);
    const favorite = await favoriteJob({ jobId: payload.jobId, employeeId: req.user.id });
    res.status(201).json({ data: favorite });
  } catch (err) {
    next(err);
  }
});

router.delete('/favorites/:jobId', async (req, res, next) => {
  try {
    const { jobId } = req.params;
    if (!z.string().uuid().safeParse(jobId).success) {
      throw createHttpError(400, 'Invalid job identifier');
    }
    await unfavoriteJob({ jobId, employeeId: req.user.id });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

router.get('/favorites', async (req, res, next) => {
  try {
    const favorites = await listFavoriteJobsForUser(req.user.id);
    res.json({ data: favorites });
  } catch (err) {
    next(err);
  }
});

export default router;
