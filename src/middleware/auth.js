import * as User from '../models/userModel.js';
import { AppError } from '../utils/AppError.js';

// Loads the logged-in user fresh from the database on every request, so a role
// change by an admin takes effect immediately and deleted users are logged out.
export async function attachUser(req, res, next) {
  req.user = null;
  if (req.session.userId) {
    const user = await User.findById(req.session.userId);
    if (user) {
      req.user = user;
      res.locals.currentUser = user;
    } else {
      delete req.session.userId;
    }
  }
  next();
}

function sendToLogin(req, res) {
  if (req.method === 'GET') req.session.returnTo = req.originalUrl;
  req.flash('error', 'Please log in to continue.');
  return res.redirect('/login');
}

export function requireAuth(req, res, next) {
  if (!req.user) return sendToLogin(req, res);
  next();
}

// Usage: requireRole('admin') or requireRole('director', 'admin')
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) return sendToLogin(req, res);
    if (!allowedRoles.includes(req.user.role)) {
      throw new AppError('You do not have permission to view this page.', 403);
    }
    next();
  };
}

// For /login and /register: logged-in users have no reason to see them.
export function redirectIfAuthed(req, res, next) {
  if (req.user) return res.redirect('/account');
  next();
}
