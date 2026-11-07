import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import pool from './db.js';
import { SESSION_COOKIE_NAME } from './constants.js';

const PgStore = connectPgSimple(session);
const isProduction = process.env.NODE_ENV === 'production';

export default function sessionMiddleware() {
  if (!process.env.SESSION_SECRET) {
    throw new Error('SESSION_SECRET is not set.');
  }

  return session({
    // Sessions live in the "session" table in PostgreSQL (created by schema.sql).
    store: new PgStore({ pool, tableName: 'session', createTableIfMissing: false }),
    name: SESSION_COOKIE_NAME,
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true, // JavaScript in the browser cannot read the cookie
      secure: isProduction, // HTTPS only in production
      sameSite: 'lax', // basic protection against cross-site requests
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    },
  });
}
