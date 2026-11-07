import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;

const isProduction = process.env.NODE_ENV === 'production';
const useSsl = isProduction || process.env.DATABASE_SSL === 'true';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set. Copy .env.example to .env and fill it in.');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: useSsl ? { rejectUnauthorized: false } : false,
});

export default pool;
