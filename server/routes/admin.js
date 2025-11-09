import { Router } from 'express';
import createHttpError from 'http-errors';
import { z } from 'zod';
import { authenticate, authorizeRoles } from '../middleware/auth.js';
import {
  deleteUser,
  getUserById,
  listUsers,
  setUserActiveStatus,
  updateUserProfile,
} from '../services/userService.js';

const router = Router();

const updateStatusSchema = z.object({
  isActive: z.boolean(),
});

const profileUpdateSchema = z
  .object({
    name: z.string().min(3).optional(),
    phone: z.string().min(6).max(30).nullable().optional(),
    location: z.string().max(255).nullable().optional(),
  })
  .partial();

const listUsersSchema = z.object({
  role: z.enum(['employer', 'employee', 'admin']).optional(),
  isActive: z
    .preprocess((value) => {
      if (value === undefined) return undefined;
      if (value === 'true' || value === true) return true;
      if (value === 'false' || value === false) return false;
      return undefined;
    }, z.boolean())
    .optional(),
});

function mapAdminProfile(user) {
  return {
    name: user.fullName,
    role: 'Platform Admin',
    email: user.email,
    phone: user.phone ?? '',
    location: user.location ?? '',
  };
}

router.use(authenticate, authorizeRoles('admin'));

router.get('/profile', async (req, res, next) => {
  try {
    const user = await getUserById(req.user.id);
    if (!user) {
      throw createHttpError(404, 'User not found');
    }
    res.json(mapAdminProfile(user));
  } catch (err) {
    next(err);
  }
});

router.put('/profile', async (req, res, next) => {
  try {
    const payload = profileUpdateSchema.parse(req.body);
    const user = await updateUserProfile(req.user.id, {
      fullName: payload.name,
      phone: payload.phone ?? null,
      location: payload.location ?? null,
    });
    if (!user) {
      throw createHttpError(404, 'User not found');
    }
    res.json(mapAdminProfile(user));
  } catch (err) {
    next(err);
  }
});

router.get('/users', async (req, res, next) => {
  try {
    const filters = listUsersSchema.parse(req.query);
    const users = await listUsers(filters);
    res.json({ data: users });
  } catch (err) {
    next(err);
  }
});

router.patch('/users/:userId/status', async (req, res, next) => {
  try {
    const { userId } = req.params;
    const payload = updateStatusSchema.parse(req.body);

    const user = await getUserById(userId);
    if (!user) {
      throw createHttpError(404, 'User not found');
    }

    await setUserActiveStatus(userId, payload.isActive);

    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

router.delete('/users/:userId', async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await getUserById(userId);
    if (!user) {
      throw createHttpError(404, 'User not found');
    }
    await deleteUser(userId);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;
