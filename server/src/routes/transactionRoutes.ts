import { Router } from 'express';
import { upload } from '../middleware/upload';
import {
  uploadTransactions,
  getTransactions,
  getYearlySummary,
  getMonthlySummary,
  getDailySummary,
  deleteBatch,
  deleteAllTransactions,
  exportTransactions
} from '../controllers/transactionController';

const router = Router();

router.post('/upload', upload.single('file'), uploadTransactions);
router.get('/', getTransactions);
router.get('/summary/yearly', getYearlySummary);
router.get('/summary/monthly/:year/:month', getMonthlySummary);
router.get('/summary/daily/:year/:month/:day', getDailySummary);
router.delete('/batch/:batchId', deleteBatch);
router.delete('/all', deleteAllTransactions);
router.get('/export', exportTransactions);

export default router;
