import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import * as auth from '../controllers/authController.js';
import { redirectIfAuthed } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { loginRules, registerRules } from '../validators/authValidators.js';
import { AppError } from '../utils/AppError.js';

const router = Router();

// Slows down password guessing.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => next(new AppError('Too many attempts. Please try again in a few minutes.', 429)),
});

router.get('/register', redirectIfAuthed, auth.showRegister);
router.post('/register', authLimiter, redirectIfAuthed, registerRules, validate('auth/register', 'Create account'), auth.register);

router.get('/login', redirectIfAuthed, auth.showLogin);
router.post('/login', authLimiter, redirectIfAuthed, loginRules, validate('auth/login', 'Log in'), auth.login);

router.post('/logout', auth.logout);

export default router;
