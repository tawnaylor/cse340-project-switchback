// Placeholder until the shop and race features are built.
export function comingSoon(section) {
  return (req, res) => {
    res.render('pages/coming-soon', { title: section, section });
  };
}

export function account(req, res) {
  res.render('account/dashboard', { title: 'My account' });
}

export function directorDashboard(req, res) {
  res.render('director/dashboard', { title: 'Race director dashboard' });
}
