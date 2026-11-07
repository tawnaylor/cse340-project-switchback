import bcrypt from 'bcryptjs';
import * as User from '../models/userModel.js';
import { HOME_BY_ROLE, SESSION_COOKIE_NAME } from '../config/constants.js';

const SALT_ROUNDS = 12;
const isProduction = process.env.NODE_ENV === 'production';

// Compared against when the email is unknown, so login takes the same time either way.
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', SALT_ROUNDS);

// Only allow redirects to paths on this site.
function safeReturnTo(value) {
  return typeof value === 'string' && value.startsWith('/') && !value.startsWith('//') ? value : null;
}

// New session ID on login prevents session fixation.
function startSession(req, userId) {
  return new Promise((resolve, reject) => {
    req.session.regenerate((err) => {
      if (err) return reject(err);
      req.session.userId = userId;
      resolve();
    });
  });
}

function saveSession(req) {
  return new Promise((resolve, reject) => {
    req.session.save((err) => (err ? reject(err) : resolve()));
  });
}

export function showRegister(req, res) {
  res.render('auth/register', { title: 'Create account' });
}

export async function register(req, res) {
  const { firstName, lastName, email, password } = req.body;
  const values = { firstName, lastName, email };

  const duplicate = () =>
    res.status(409).render('auth/register', {
      title: 'Create account',
      errors: ['An account with that email already exists.'],
      values,
    });

  if (await User.findByEmail(email)) return duplicate();

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  let user;
  try {
    user = await User.create({ firstName, lastName, email, passwordHash });
  } catch (err) {
    if (err.code === '23505') return duplicate(); // two sign-ups raced; unique constraint caught it
    throw err;
  }

  await startSession(req, user.id);
  req.flash('success', `Welcome to Switchback, ${user.first_name}!`);
  await saveSession(req);
  res.redirect(HOME_BY_ROLE.runner);
}

export function showLogin(req, res) {
  res.render('auth/login', { title: 'Log in' });
}

export async function login(req, res) {
  const { email, password } = req.body;

  const user = await User.findByEmail(email);
  const passwordMatches = await bcrypt.compare(password, user ? user.password_hash : DUMMY_HASH);

  if (!user || !passwordMatches) {
    // Same message for "no such email" and "wrong password" so attackers learn nothing.
    return res.status(401).render('auth/login', {
      title: 'Log in',
      errors: ['Invalid email or password.'],
      values: { email },
    });
  }

  const returnTo = safeReturnTo(req.session.returnTo);
  await startSession(req, user.id);
  req.flash('success', `Welcome back, ${user.first_name}.`);
  await saveSession(req);
  res.redirect(returnTo ?? HOME_BY_ROLE[user.role] ?? '/');
}

export function logout(req, res, next) {
  req.session.destroy((err) => {
    if (err) return next(err);
    res.clearCookie(SESSION_COOKIE_NAME, { httpOnly: true, sameSite: 'lax', secure: isProduction });
    res.redirect('/');
  });
}
