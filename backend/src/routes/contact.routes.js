import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { contactController } from '../controllers/contact.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import {
  createContactValidator,
  updateContactValidator,
} from '../validators/contact.validator.js';

const router = Router();

const uploadDir = path.resolve('uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `contacts-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv') || file.mimetype === 'application/vnd.ms-excel') {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  },
});

router.use(authMiddleware);

router.get('/', contactController.getAll);
router.get('/:id', contactController.getById);
router.post('/', createContactValidator, validate, contactController.create);
router.put('/:id', updateContactValidator, validate, contactController.update);
router.delete('/:id', contactController.delete);
router.post('/import', upload.single('file'), contactController.importContacts);

export default router;
