import { Router } from 'express';
import * as pages from '../controllers/pageController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', pages.home);

// Placeholders. Replace these with real routers as you build each feature.
router.get('/products', pages.comingSoon('Shop'));
router.get('/races', pages.comingSoon('Races'));

router.get('/account', requireAuth, pages.account);
router.get('/director', requireRole('director', 'admin'), pages.directorDashboard);

export default router;
