import { Router } from 'express';
import createHttpError from 'http-errors';
import { z } from 'zod';
import { loadEnv } from '../lib/env.js';
import { createAccessToken, createRefreshToken, verifyRefreshToken } from '../lib/jwt.js';
import { hashPassword, verifyPassword } from '../lib/password.js';
import {
  storeRefreshToken,
  revokeRefreshToken,
  revokeAllRefreshTokens,
  findRefreshToken,
} from '../services/tokenService.js';
import {
  createUser,
  getUserByEmail,
  getUserById,
  updateUserLastLogin,
} from '../services/userService.js';
import { authenticate, authorizeRoles } from '../middleware/auth.js';

const router = Router();
const env = loadEnv();

const baseRegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(12),
  fullName: z.string().min(3),
  phone: z.string().min(6).max(30).optional(),
});

const employerRegisterSchema = baseRegisterSchema.extend({
  role: z.literal('employer'),
  companyName: z.string().min(2),
  companyWebsite: z.string().url().optional(),
  companyDescription: z.string().optional(),
  companySize: z.string().optional(),
  industry: z.string().optional(),
  headquarters: z.string().optional(),
  foundedYear: z.number().int().min(1800).max(new Date().getFullYear()).optional(),
});

const employeeRegisterSchema = baseRegisterSchema.extend({
  role: z.literal('employee'),
  headline: z.string().max(255).optional(),
  location: z.string().max(255).optional(),
  yearsExperience: z.number().int().min(0).max(80).optional(),
  resumeUrl: z.string().url().optional(),
  portfolioUrl: z.string().url().optional(),
  bio: z.string().optional(),
});

const adminRegisterSchema = baseRegisterSchema.extend({
  role: z.literal('admin'),
  location: z.string().max(255).optional(),
});

const registerSchema = z.discriminatedUnion('role', [
  employerRegisterSchema,
  employeeRegisterSchema,
]);

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

function setRefreshCookie(res, token) {
  res.cookie(env.sessionCookie.name, token, {
    httpOnly: true,
    secure: env.sessionCookie.secure,
    sameSite: 'strict',
    domain: env.sessionCookie.domain,
    path: '/api/auth',
  });
}

function clearRefreshCookie(res) {
  res.clearCookie(env.sessionCookie.name, {
    httpOnly: true,
    secure: env.sessionCookie.secure,
    sameSite: 'strict',
    domain: env.sessionCookie.domain,
    path: '/api/auth',
  });
}

router.post('/register', async (req, res, next) => {
  try {
    const payload = registerSchema.parse(req.body);

    const existing = await getUserByEmail(payload.email.toLowerCase());
    if (existing) {
      throw createHttpError(409, 'Email already registered');
    }

    const passwordHash = await hashPassword(payload.password);
    const profileData = {};

    if (payload.role === 'employer') {
      profileData.employerProfile = {
        companyName: payload.companyName,
        companyWebsite: payload.companyWebsite,
        companyDescription: payload.companyDescription,
        companySize: payload.companySize,
        industry: payload.industry,
        headquarters: payload.headquarters,
        foundedYear: payload.foundedYear,
      };
    } else if (payload.role === 'employee') {
      profileData.employeeProfile = {
        headline: payload.headline,
        location: payload.location,
        yearsExperience: payload.yearsExperience,
        resumeUrl: payload.resumeUrl,
        portfolioUrl: payload.portfolioUrl,
        bio: payload.bio,
      };
    }

    const userLocation =
      payload.role === 'employee'
        ? payload.location
        : payload.role === 'employer'
          ? payload.headquarters
          : undefined;

    const user = await createUser({
      email: payload.email.toLowerCase(),
      passwordHash,
      role: payload.role,
      fullName: payload.fullName,
      phone: payload.phone,
      location: userLocation,
      ...profileData,
    });

    const accessToken = createAccessToken({ sub: user.id, role: user.role });
    const refreshToken = createRefreshToken({ sub: user.id, role: user.role });
    const decoded = verifyRefreshToken(refreshToken);

    await storeRefreshToken({
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(decoded.exp * 1000),
      userAgent: req.get('user-agent'),
      ipAddress: req.ip,
    });

    setRefreshCookie(res, refreshToken);

    res.status(201).json({
      data: {
        accessToken,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          fullName: user.fullName,
        },
      },
    });
  } catch (err) {
    next(err);
  }
});

router.post('/register/admin', authenticate, authorizeRoles('admin'), async (req, res, next) => {
  try {
    const payload = adminRegisterSchema.parse({ ...req.body, role: 'admin' });

    const existing = await getUserByEmail(payload.email.toLowerCase());
    if (existing) {
      throw createHttpError(409, 'Email already registered');
    }

    const passwordHash = await hashPassword(payload.password);
    const user = await createUser({
      email: payload.email.toLowerCase(),
      passwordHash,
      role: 'admin',
      fullName: payload.fullName,
      phone: payload.phone,
      location: payload.location,
    });

    res.status(201).json({
      data: {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const payload = loginSchema.parse(req.body);
    const user = await getUserByEmail(payload.email.toLowerCase());

    if (!user) {
      throw createHttpError(401, 'Invalid credentials');
    }

    const passwordValid = await verifyPassword(payload.password, user.passwordHash);
    if (!passwordValid) {
      throw createHttpError(401, 'Invalid credentials');
    }

    if (!user.isActive) {
      throw createHttpError(403, 'Account disabled');
    }

    const accessToken = createAccessToken({ sub: user.id, role: user.role });
    const refreshToken = createRefreshToken({ sub: user.id, role: user.role });
    const decoded = verifyRefreshToken(refreshToken);

    await updateUserLastLogin(user.id);

    await storeRefreshToken({
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(decoded.exp * 1000),
      userAgent: req.get('user-agent'),
      ipAddress: req.ip,
    });

    setRefreshCookie(res, refreshToken);

    res.json({
      data: {
        accessToken,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          fullName: user.fullName,
        },
      },
    });
  } catch (err) {
    next(err);
  }
});

router.post('/logout', authenticate, async (req, res, next) => {
  try {
    const token = req.cookies?.[env.sessionCookie.name];
    if (token) {
      await revokeRefreshToken({ token, userId: req.user.id });
    }
    clearRefreshCookie(res);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

router.post('/logout-all', authenticate, async (req, res, next) => {
  try {
    await revokeAllRefreshTokens(req.user.id);
    clearRefreshCookie(res);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

router.post('/refresh', async (req, res, next) => {
  try {
    const token = req.cookies?.[env.sessionCookie.name] ?? req.body.refreshToken;
    if (!token) {
      throw createHttpError(401, 'Refresh token missing');
    }

    const payload = verifyRefreshToken(token);
    const stored = await findRefreshToken({ token, userId: payload.sub });
    if (!stored) {
      throw createHttpError(401, 'Refresh token revoked');
    }

    const user = await getUserById(payload.sub);
    if (!user) {
      throw createHttpError(404, 'User not found');
    }

    const accessToken = createAccessToken({ sub: user.id, role: user.role });
    const newRefreshToken = createRefreshToken({ sub: user.id, role: user.role });
    const decoded = verifyRefreshToken(newRefreshToken);

    await storeRefreshToken({
      token: newRefreshToken,
      userId: user.id,
      expiresAt: new Date(decoded.exp * 1000),
      userAgent: req.get('user-agent'),
      ipAddress: req.ip,
    });

    await revokeRefreshToken({ token, userId: user.id });

    setRefreshCookie(res, newRefreshToken);

    res.json({
      data: {
        accessToken,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.get('/me', authenticate, async (req, res, next) => {
  try {
    const user = await getUserById(req.user.id);
    if (!user) {
      throw createHttpError(404, 'User not found');
    }
    res.json({
      data: {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
        phone: user.phone,
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
