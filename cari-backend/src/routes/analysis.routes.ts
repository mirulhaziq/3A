import { Router } from 'express';
import { authMiddleware, requireRole } from '../middleware/auth.middleware';
import { analysisRequestSchema } from '../schemas/analysis.schema';
import { analyseCvAgainstJob } from '../services/analysis.service';

const analysisRouter = Router();

analysisRouter.use(authMiddleware);
analysisRouter.use(requireRole('JOB_SEEKER'));

analysisRouter.post('/', async (req, res, next): Promise<void> => {
  try {
    const input = analysisRequestSchema.parse(req.body);
    const analysis = await analyseCvAgainstJob(req.user.id, input);
    res.status(201).json({ success: true, data: { analysis } });
  } catch (error) {
    next(error);
  }
});

export { analysisRouter };
