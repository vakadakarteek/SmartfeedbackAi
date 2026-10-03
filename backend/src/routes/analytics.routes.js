import { Router } from 'express';
import { analyticsController } from '../controllers/analytics.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/', analyticsController.getOverview);
router.get('/overview', analyticsController.getOverview);
router.get('/charts', analyticsController.getCharts);
router.get('/dashboard', analyticsController.getDashboard);
router.get('/generation', analyticsController.getGenerationAnalytics);
router.get('/messages', analyticsController.getMessageAnalytics);

export default router;
