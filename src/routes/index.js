import { Router } from 'express';
import homeRoutes from './homeRoutes.js';
import authRoutes from './authRoutes.js';
import adminRoutes from './adminRoutes.js';
import productRoutes from './productRoutes.js';
import pageRoutes from './pageRoutes.js';

// One place that lists every route group. app.js only needs to mount this.
// As you build more features, add their routers here.
const router = Router();

router.use('/', homeRoutes);
router.use('/', authRoutes);
router.use('/admin', adminRoutes);
router.use('/products', productRoutes);
router.use('/', pageRoutes);

export default router;
