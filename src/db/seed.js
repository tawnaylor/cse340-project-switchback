import bcrypt from 'bcryptjs';
import pool from '../config/db.js';
import { ROLES } from '../config/constants.js';

// Shared password for the test accounts (the assignment asks for this one).
const TEST_PASSWORD = 'P@$$w0rd!';

const testUsers = [
  { firstName: 'Ada', lastName: 'Admin', email: 'admin@switchback.test', role: 'admin' },
  { firstName: 'Dana', lastName: 'Director', email: 'director@switchback.test', role: 'director' },
  { firstName: 'Riley', lastName: 'Runner', email: 'runner@switchback.test', role: 'runner' },
];

const brands = [
  ['Ridgeback', 'Aggressive-lug shoes built for loose, technical climbs.'],
  ['Cairn Outdoor', 'Packs, vests, and hydration for long days out.'],
  ['Juniper Labs', 'Lightweight, cushioned shoes for fast, groomed trails.'],
  ['Talus Gear', 'Socks, lights, poles, and small essentials.'],
];

const categories = [
  ['Trail Shoes', 'trail-shoes'],
  ['Packs & Vests', 'packs-vests'],
  ['Hydration', 'hydration'],
  ['Apparel', 'apparel'],
  ['Socks', 'socks'],
  ['Lighting', 'lighting'],
  ['Poles', 'poles'],
  ['Accessories', 'accessories'],
];

const terrainTags = [
  ['Rocky', 'rocky'],
  ['Muddy', 'muddy'],
  ['Technical', 'technical'],
  ['Groomed', 'groomed'],
  ['Alpine', 'alpine'],
  ['Desert', 'desert'],
  ['Mixed', 'mixed'],
];

async function run() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    for (const role of ROLES) {
      await client.query('INSERT INTO roles (name) VALUES ($1) ON CONFLICT (name) DO NOTHING', [role]);
    }

    const passwordHash = await bcrypt.hash(TEST_PASSWORD, 12);
    for (const u of testUsers) {
      await client.query(
        `INSERT INTO users (role_id, first_name, last_name, email, password_hash)
         VALUES ((SELECT id FROM roles WHERE name = $1), $2, $3, $4, $5)
         ON CONFLICT (email) DO NOTHING`,
        [u.role, u.firstName, u.lastName, u.email, passwordHash]
      );
    }

    for (const [name, description] of brands) {
      await client.query(
        'INSERT INTO brands (name, description) VALUES ($1, $2) ON CONFLICT (name) DO NOTHING',
        [name, description]
      );
    }

    for (const [name, slug] of categories) {
      await client.query(
        'INSERT INTO categories (name, slug) VALUES ($1, $2) ON CONFLICT (name) DO NOTHING',
        [name, slug]
      );
    }

    for (const [name, slug] of terrainTags) {
      await client.query(
        'INSERT INTO terrain_tags (name, slug) VALUES ($1, $2) ON CONFLICT (name) DO NOTHING',
        [name, slug]
      );
    }

    await client.query('COMMIT');
    console.log('Seed complete. Test accounts:');
    for (const u of testUsers) console.log(`  ${u.role.padEnd(9)} ${u.email}`);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

try {
  await run();
} catch (err) {
  console.error('Seed failed:', err.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
