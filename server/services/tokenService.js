import crypto from 'crypto';
import { and, eq } from 'drizzle-orm';
import { getDb } from '../db/index.js';
import { refreshTokens } from '../db/schema.js';

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function storeRefreshToken({
  token,
  userId,
  expiresAt,
  userAgent,
  ipAddress,
}) {
  const db = getDb();
  const tokenHash = hashToken(token);
  await db
    .insert(refreshTokens)
    .values({
      userId,
      tokenHash,
      expiresAt,
      userAgent,
      ipAddress,
    })
    .onConflictDoNothing();
  return tokenHash;
}

export async function revokeRefreshToken({ token, userId }) {
  const db = getDb();
  const tokenHash = hashToken(token);
  await db
    .delete(refreshTokens)
    .where(
      and(eq(refreshTokens.tokenHash, tokenHash), eq(refreshTokens.userId, userId)),
    );
}

export async function revokeAllRefreshTokens(userId) {
  const db = getDb();
  await db.delete(refreshTokens).where(eq(refreshTokens.userId, userId));
}

export async function findRefreshToken({ token, userId }) {
  const db = getDb();
  const tokenHash = hashToken(token);
  const [record] = await db
    .select()
    .from(refreshTokens)
    .where(
      and(eq(refreshTokens.tokenHash, tokenHash), eq(refreshTokens.userId, userId)),
    )
    .limit(1);
  return record;
}
