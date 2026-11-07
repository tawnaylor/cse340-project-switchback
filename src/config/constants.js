export const ROLES = ['admin', 'director', 'runner'];

// Where each role lands after logging in.
export const HOME_BY_ROLE = {
  admin: '/admin',
  director: '/director',
  runner: '/account',
};

export const SESSION_COOKIE_NAME = 'switchback.sid';

// Allowed values for ?sort= on the shop page.
export const PRODUCT_SORTS = ['newest', 'price-asc', 'price-desc', 'name'];
