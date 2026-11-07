// One-time messages stored in the session (shown on the next page, then cleared).
export function flash(req, res, next) {
  if (req.session.flash) {
    res.locals.flash = req.session.flash;
    delete req.session.flash;
  }
  req.flash = (type, message) => {
    req.session.flash = { type, message };
  };
  next();
}
