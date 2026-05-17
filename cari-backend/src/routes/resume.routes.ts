import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { uploadCV } from '../middleware/upload.middleware';
import { claudeRateLimit, uploadRateLimit } from '../middleware/ratelimit.middleware';
import * as resumeController from '../controllers/resume.controller';

const router = Router();

router.use(authMiddleware);

router.post('/upload', uploadCV, uploadRateLimit, resumeController.upload);
router.post('/analyse', claudeRateLimit, resumeController.analyse);
router.get('/download/:id', resumeController.download);

export { router as resumeRouter };
