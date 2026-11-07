import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pool from '../config/db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const reset = process.argv.includes('--reset');

async function run() {
  if (reset && process.env.NODE_ENV === 'production') {
    throw new Error('Refusing to reset a production database.');
  }

  if (reset) {
    console.log('Dropping all tables...');
    await pool.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
  }

  const sql = await fs.readFile(path.join(__dirname, 'schema.sql'), 'utf8');
  await pool.query(sql);
  console.log('Database schema is up to date.');
}

try {
  await run();
} catch (err) {
  console.error('Migration failed:', err.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
