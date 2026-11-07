import { validationResult } from 'express-validator';
import { AppError } from '../utils/AppError.js';

// For forms: if validation fails, re-render the same page with the errors
// and the values the user typed (never the passwords).
export function validate(view, title) {
  return (req, res, next) => {
    const result = validationResult(req);
    if (result.isEmpty()) return next();

    const { password, confirmPassword, _csrf, ...values } = req.body ?? {};
    res.status(422).render(view, {
      title,
      errors: result.array().map((e) => e.msg),
      values,
    });
  };
}

// For actions without a form of their own (buttons, links): fail with a 400.
export function validateOrFail(req, res, next) {
  const result = validationResult(req);
  if (result.isEmpty()) return next();
  throw new AppError(result.array()[0].msg, 400);
}
