import { Router } from 'express';
import { authMiddleware, requireRole } from '../middleware/auth.middleware';
import { resumeGenerationRequestSchema } from '../schemas/resume-generation.schema';
import { generateResumeForUser } from '../services/resume-generation.service';

const resumeGenerationRouter = Router();

resumeGenerationRouter.use(authMiddleware);
resumeGenerationRouter.use(requireRole('JOB_SEEKER'));

resumeGenerationRouter.post('/generate', async (req, res, next): Promise<void> => {
  try {
    const input = resumeGenerationRequestSchema.parse(req.body);
    const resume = await generateResumeForUser(req.user.id, input);
    res.status(201).json({ success: true, data: { resume } });
  } catch (error) {
    next(error);
  }
});

export { resumeGenerationRouter };
