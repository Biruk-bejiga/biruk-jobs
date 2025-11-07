import createHttpError from 'http-errors';
import { verifyAccessToken } from '../lib/jwt.js';
import { getUserById } from '../services/userService.js';

export async function authenticate(req, _res, next) {
  try {
    const header = req.get('Authorization');
    const token = header?.startsWith('Bearer ')
      ? header.slice('Bearer '.length)
      : null;

    if (!token) {
      throw createHttpError(401, 'Authentication token missing');
    }

    const payload = verifyAccessToken(token);
    const user = await getUserById(payload.sub);

    if (!user || !user.isActive) {
      throw createHttpError(401, 'User inactive or missing');
    }

    req.user = {
      id: user.id,
      role: user.role,
      email: user.email,
      fullName: user.fullName,
    };

    next();
  } catch (err) {
    next(createHttpError(401, err.message ?? 'Invalid authentication token'));
  }
}

export function authorizeRoles(...roles) {
  return function authorize(req, _res, next) {
    if (!req.user) {
      return next(createHttpError(401, 'Authentication required'));
    }
    if (!roles.includes(req.user.role)) {
      return next(createHttpError(403, 'Insufficient permissions'));
    }
    return next();
  };
}
