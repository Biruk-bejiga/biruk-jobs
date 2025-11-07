import jwt from 'jsonwebtoken';
import { loadEnv } from './env.js';
import crypto from 'crypto';

function getJwtConfig() {
  const env = loadEnv();
  return env.jwt;
}

export function createAccessToken(payload) {
  const config = getJwtConfig();
  return jwt.sign(payload, config.accessSecret, { expiresIn: config.accessTtl });
}

export function createRefreshToken(payload) {
  const config = getJwtConfig();
  return jwt.sign({ ...payload, tokenId: crypto.randomUUID() }, config.refreshSecret, {
    expiresIn: config.refreshTtl,
  });
}

export function verifyAccessToken(token) {
  const config = getJwtConfig();
  return jwt.verify(token, config.accessSecret);
}

export function verifyRefreshToken(token) {
  const config = getJwtConfig();
  return jwt.verify(token, config.refreshSecret);
}
