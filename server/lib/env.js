import process from 'process';
import dotenv from 'dotenv';
import { config } from 'dotenv';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

let cachedEnv;
const __dirname = dirname(fileURLToPath(import.meta.url));
config({
  path: join(__dirname, '../.env'),
  override: false,
});
export function loadEnv() {
  if (cachedEnv) {
    return cachedEnv;
  }

  dotenv.config();
  const {
    DATABASE_URL,
    JWT_ACCESS_SECRET,
    JWT_REFRESH_SECRET,
    JWT_ACCESS_EXPIRES_IN = '15m',
    JWT_REFRESH_EXPIRES_IN = '7d',
    SESSION_COOKIE_NAME = 'biruk_jobs_session',
    SESSION_COOKIE_DOMAIN,
    SESSION_COOKIE_SECURE = 'false',
    PORT = '4000',
    CORS_ORIGIN,
  } = process.env;

  if (!DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  if (!JWT_ACCESS_SECRET || !JWT_REFRESH_SECRET) {
    throw new Error('JWT secrets (JWT_ACCESS_SECRET, JWT_REFRESH_SECRET) are required');
  }

  cachedEnv = {
    databaseUrl: DATABASE_URL,
    port: Number.parseInt(PORT, 10) || 4000,
    corsOrigins: (CORS_ORIGIN ?? 'http://localhost:5173')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
    jwt: {
      accessSecret: JWT_ACCESS_SECRET,
      refreshSecret: JWT_REFRESH_SECRET,
      accessTtl: JWT_ACCESS_EXPIRES_IN,
      refreshTtl: JWT_REFRESH_EXPIRES_IN,
    },
    sessionCookie: {
      name: SESSION_COOKIE_NAME,
      domain: SESSION_COOKIE_DOMAIN,
      secure: SESSION_COOKIE_SECURE === 'true',
    },
  };

  return cachedEnv;
}
