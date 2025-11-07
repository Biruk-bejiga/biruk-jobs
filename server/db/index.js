import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { loadEnv } from '../lib/env.js';

const { Pool } = pg;

let pool;
let dbInstance;

function createPool() {
  const env = loadEnv();
  pool = new Pool({
    connectionString: env.databaseUrl,
    ssl: env.databaseUrl.includes('sslmode=require')
      ? { rejectUnauthorized: false }
      : undefined,
  });
  pool.on('error', (err) => {
    console.error('Postgres pool error', err);
  });
  return pool;
}

export function getPool() {
  if (!pool) {
    pool = createPool();
  }
  return pool;
}

export function getDb() {
  if (!dbInstance) {
    dbInstance = drizzle(getPool());
  }
  return dbInstance;
}

export async function verifyDatabaseConnection() {
  const currentPool = getPool();
  const client = await currentPool.connect();
  try {
    await client.query('select 1');
  } finally {
    client.release();
  }
}
