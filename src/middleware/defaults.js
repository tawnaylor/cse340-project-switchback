// Safe default values so every view (including error pages) can render
// even if a later middleware fails.
export function defaults(req, res, next) {
  res.locals.title = '';
  res.locals.currentUser = null;
  res.locals.currentPath = req.path;
  res.locals.flash = null;
  res.locals.csrfToken = '';
  res.locals.errors = [];
  res.locals.values = {};
  next();
}
