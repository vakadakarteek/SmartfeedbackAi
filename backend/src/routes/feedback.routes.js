import { Router } from 'express';
import { feedbackController } from '../controllers/feedback.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { aiGenerationLimiter } from '../middleware/rateLimit.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import {
  generateFeedbackValidator,
  updateFeedbackValidator,
  regenerateFeedbackValidator,
} from '../validators/feedback.validator.js';

const router = Router();

router.use(authMiddleware);

router.post('/generate', aiGenerationLimiter, generateFeedbackValidator, validate, feedbackController.generate);
router.get('/', feedbackController.getAll);
router.get('/:id', feedbackController.getById);
router.put('/:id', updateFeedbackValidator, validate, feedbackController.update);
router.delete('/:id', feedbackController.delete);
router.post('/:id/regenerate', aiGenerationLimiter, regenerateFeedbackValidator, validate, feedbackController.regenerate);
router.post('/:id/approve', feedbackController.approve);

export default router;
