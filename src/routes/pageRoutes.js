import { Router } from 'express';
import * as pages from '../controllers/pageController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

// Placeholder. Replaced when we build the race pages.
router.get('/races', pages.comingSoon('Races'));

router.get('/account', requireAuth, pages.account);
router.get('/director', requireRole('director', 'admin'), pages.directorDashboard);

export default router;
