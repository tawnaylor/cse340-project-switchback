export const ROLES = ['admin', 'director', 'runner'];

// Where each role lands after logging in.
export const HOME_BY_ROLE = {
  admin: '/admin',
  director: '/director',
  runner: '/account',
};

export const SESSION_COOKIE_NAME = 'switchback.sid';
