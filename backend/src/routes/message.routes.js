import { Router } from 'express';
import { messageController } from '../controllers/message.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { messageSendLimiter } from '../middleware/rateLimit.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import { sendMessageValidator } from '../validators/message.validator.js';

const router = Router();

router.use(authMiddleware);

router.post('/send', messageSendLimiter, sendMessageValidator, validate, messageController.send);
router.get('/history', messageController.getHistory);
router.get('/history/:id', messageController.getHistoryItem);
router.get('/:id', messageController.getHistoryItem);

export default router;
