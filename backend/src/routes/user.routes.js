import { Router } from 'express';
import { userController } from '../controllers/user.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import {
  updateProfileValidator,
  updatePreferencesValidator,
  updatePasswordValidator,
} from '../validators/auth.validator.js';

const router = Router();

router.use(authMiddleware);

router.get('/profile', userController.getProfile);
router.put('/profile', updateProfileValidator, validate, userController.updateProfile);
router.put('/preferences', updatePreferencesValidator, validate, userController.updatePreferences);
router.put('/password', updatePasswordValidator, validate, userController.updatePassword);

export default router;
