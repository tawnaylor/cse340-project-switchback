import { body } from 'express-validator';

// Letters (any language), spaces, apostrophes, periods, and hyphens only.
const NAME_PATTERN = /^[\p{L}\p{M}][\p{L}\p{M}' .-]*$/u;

const nameRule = (field, label) =>
  body(field)
    .trim()
    .notEmpty().withMessage(`${label} is required.`).bail()
    .isLength({ max: 50 }).withMessage(`${label} must be 50 characters or fewer.`).bail()
    .matches(NAME_PATTERN).withMessage(`${label} contains invalid characters.`);

export const registerRules = [
  nameRule('firstName', 'First name'),
  nameRule('lastName', 'Last name'),
  body('email')
    .trim()
    .isEmail().withMessage('Enter a valid email address.').bail()
    .isLength({ max: 255 }).withMessage('Email is too long.')
    .toLowerCase(),
  body('password')
    .isLength({ min: 8, max: 72 }).withMessage('Password must be 8 to 72 characters.').bail()
    .matches(/[A-Za-z]/).withMessage('Password must include a letter.').bail()
    .matches(/\d/).withMessage('Password must include a number.'),
  body('confirmPassword')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Passwords do not match.'),
];

export const loginRules = [
  body('email').trim().isEmail().withMessage('Enter a valid email address.').toLowerCase(),
  body('password').notEmpty().withMessage('Password is required.'),
];
