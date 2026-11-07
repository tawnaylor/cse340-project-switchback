import { body, param } from 'express-validator';
import { ROLES } from '../config/constants.js';

export const roleChangeRules = [
  param('id').isInt({ min: 1 }).withMessage('Invalid user.').toInt(),
  body('role').isIn(ROLES).withMessage('Invalid role.'),
];
