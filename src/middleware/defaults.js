import { formatPrice, formatDate, monthShort, dayOfMonth, stars } from '../utils/format.js';

// Safe default values so every view (including error pages) can render
// even if a later middleware fails. Also makes the format helpers
// available in every EJS template.
export function defaults(req, res, next) {
  res.locals.title = '';
  res.locals.currentUser = null;
  res.locals.currentPath = req.path;
  res.locals.flash = null;
  res.locals.csrfToken = '';
  res.locals.errors = [];
  res.locals.values = {};

  res.locals.formatPrice = formatPrice;
  res.locals.formatDate = formatDate;
  res.locals.monthShort = monthShort;
  res.locals.dayOfMonth = dayOfMonth;
  res.locals.stars = stars;
  next();
}
