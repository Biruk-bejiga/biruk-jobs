import { Client } from 'pg';

const connectionString = process.env.DATABASE_URL ?? 'postgresql://neondb_owner:npg_eb3jBOGp0gkm@ep-long-truth-adxppln9-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  try {
    await client.connect();
    const branchInfo = await client.query(
      "SELECT current_database() AS database, current_schema() AS schema, current_setting('neon.database_id', true) AS database_id, current_setting('neon.project_id', true) AS project_id, current_setting('neon.timeline_id', true) AS timeline_id, current_setting('neon.endpoint_id', true) AS endpoint_id, current_setting('neon.branch_name', true) AS branch_name;",
    );
    console.log('Connection info:', branchInfo.rows[0]);
    const result = await client.query(
      "SELECT table_schema, table_name FROM information_schema.tables WHERE table_schema IN ('public', 'neon_auth') ORDER BY table_schema, table_name;",
    );
    console.log(result.rows);
  } catch (error) {
    console.error('Failed to list tables:', error);
  } finally {
    await client.end();
  }
}

main();
