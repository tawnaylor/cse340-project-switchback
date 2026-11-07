import { Router } from 'express';
import * as admin from '../controllers/adminController.js';
import { requireRole } from '../middleware/auth.js';
import { validateOrFail } from '../middleware/validate.js';
import { roleChangeRules } from '../validators/adminValidators.js';

const router = Router();

// Everything under /admin requires the admin role.
router.use(requireRole('admin'));

router.get('/', admin.dashboard);
router.post('/users/:id/role', roleChangeRules, validateOrFail, admin.updateUserRole);

export default router;
