import crypto from 'node:crypto';
import { AppError } from '../utils/AppError.js';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

// Each session gets a random token. Every POST form must send it back in
// a hidden field named _csrf, which stops other sites from submitting forms for the user.
export function csrf(req, res, next) {
  if (!req.session.csrfToken) {
    req.session.csrfToken = crypto.randomBytes(32).toString('hex');
  }
  res.locals.csrfToken = req.session.csrfToken;

  if (SAFE_METHODS.has(req.method)) return next();

  const sent = req.body?._csrf;
  const expected = req.session.csrfToken;
  const valid =
    typeof sent === 'string' &&
    sent.length === expected.length &&
    crypto.timingSafeEqual(Buffer.from(sent), Buffer.from(expected));

  if (!valid) {
    throw new AppError('Your form expired or was invalid. Please go back, refresh, and try again.', 403);
  }
  next();
}
