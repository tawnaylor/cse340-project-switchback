import { Router } from 'express';
import * as products from '../controllers/productController.js';
import { listRules } from '../validators/productValidators.js';

const router = Router();

router.get('/', listRules, products.index);

export default router;
