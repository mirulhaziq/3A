import { Router } from 'express';
import { authMiddleware, requireRole } from '../middleware/auth.middleware';
import { githubScrapeRequestSchema } from '../schemas/github.schema';
import { scrapeGitHubProfile } from '../services/github.service';

const githubRouter = Router();

githubRouter.use(authMiddleware);
githubRouter.use(requireRole('JOB_SEEKER'));

githubRouter.post('/scrape', async (req, res, next): Promise<void> => {
  try {
    const input = githubScrapeRequestSchema.parse(req.body);
    const snapshot = await scrapeGitHubProfile(req.user.id, input);
    res.status(201).json({ success: true, data: { github: snapshot } });
  } catch (error) {
    next(error);
  }
});

export { githubRouter };
