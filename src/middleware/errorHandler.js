import { AppError } from '../utils/AppError.js';

const isProduction = process.env.NODE_ENV === 'production';

export function notFound(req, res, next) {
  next(new AppError('We could not find that page.', 404));
}

// The one place every error ends up. Express 5 sends rejected promises here automatically.
export function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  const status = err.status || err.statusCode || 500;

  if (status >= 500) console.error(err);

  // In production, only show messages we wrote ourselves. Never leak internals.
  let message;
  if (err.isOperational) {
    message = err.message;
  } else if (!isProduction) {
    message = err.message;
  } else if (status >= 500) {
    message = 'Something went wrong on our end. Please try again later.';
  } else {
    message = 'There was a problem with your request.';
  }

  const titles = { 403: 'Not allowed', 404: 'Page not found', 429: 'Slow down' };

  res.status(status).render('errors/error', {
    title: titles[status] || 'Something went wrong',
    status,
    message,
  });
}
