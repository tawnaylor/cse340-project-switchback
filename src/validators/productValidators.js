import { query } from 'express-validator';
import { PRODUCT_SORTS } from '../config/constants.js';

// Validates the shop page filters (?q=...&terrain=...&sort=...&page=...).
// Anything invalid is simply dropped, so a bad link never breaks the page.
export const listRules = [
  query('q').optional({ values: 'falsy' }).isString().trim().isLength({ max: 60 }),
  query('category').optional({ values: 'falsy' }).isString().trim().matches(/^[a-z0-9-]+$/),
  query('terrain').optional({ values: 'falsy' }).isString().trim().matches(/^[a-z0-9-]+$/),
  query('brand').optional({ values: 'falsy' }).isInt({ min: 1 }).toInt(),
  query('sort').optional({ values: 'falsy' }).isIn(PRODUCT_SORTS),
  query('page').optional({ values: 'falsy' }).isInt({ min: 1, max: 1000 }).toInt(),
];
