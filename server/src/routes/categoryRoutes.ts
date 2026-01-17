import { Router } from 'express';
import {
  getCategorySummary,
  updateTransactionCategory,
  getCategories,
  getCategoryRulesHandler,
  recategorizeTransactions
} from '../controllers/categoryController';

const router = Router();

router.get('/summary/:year/:month', getCategorySummary);
router.patch('/transaction/:id', updateTransactionCategory);
router.get('/', getCategories);
router.get('/rules', getCategoryRulesHandler);
router.post('/recategorize', recategorizeTransactions);

export default router;
