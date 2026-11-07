import pool from '../config/db.js';

// Every query is parameterized ($1, $2, ...). User input is never concatenated into SQL.
// Errors are not caught here on purpose, so they reach the global error handler.

export async function findByEmail(email) {
  const { rows } = await pool.query(
    `SELECT u.id, u.first_name, u.last_name, u.email, u.password_hash, r.name AS role
     FROM users u
     JOIN roles r ON r.id = u.role_id
     WHERE u.email = $1`,
    [email]
  );
  return rows[0] ?? null;
}

export async function findById(id) {
  const { rows } = await pool.query(
    `SELECT u.id, u.first_name, u.last_name, u.email, u.created_at, r.name AS role
     FROM users u
     JOIN roles r ON r.id = u.role_id
     WHERE u.id = $1`,
    [id]
  );
  return rows[0] ?? null;
}

export async function create({ firstName, lastName, email, passwordHash, role = 'runner' }) {
  const { rows } = await pool.query(
    `INSERT INTO users (role_id, first_name, last_name, email, password_hash)
     VALUES ((SELECT id FROM roles WHERE name = $1), $2, $3, $4, $5)
     RETURNING id, first_name, last_name, email`,
    [role, firstName, lastName, email, passwordHash]
  );
  return rows[0];
}

export async function listAll() {
  const { rows } = await pool.query(
    `SELECT u.id, u.first_name, u.last_name, u.email, u.created_at, r.name AS role
     FROM users u
     JOIN roles r ON r.id = u.role_id
     ORDER BY u.created_at DESC`
  );
  return rows;
}

export async function countByRole() {
  const { rows } = await pool.query(
    `SELECT r.name AS role, COUNT(u.id)::int AS total
     FROM roles r
     LEFT JOIN users u ON u.role_id = r.id
     GROUP BY r.name`
  );
  return Object.fromEntries(rows.map((row) => [row.role, row.total]));
}

export async function updateRole(userId, role) {
  const { rowCount } = await pool.query(
    `UPDATE users
     SET role_id = (SELECT id FROM roles WHERE name = $1), updated_at = NOW()
     WHERE id = $2`,
    [role, userId]
  );
  return rowCount > 0;
}
