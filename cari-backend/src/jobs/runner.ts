import { Request, Response } from 'express';
import { runFollowupJob } from './followup.job';
import { runDriftJob } from './drift.job';
import { runNudgeJob } from './nudge.job';
import { logger } from '../lib/logger';

async function jobRunner(req: Request, res: Response): Promise<void> {
  const cronSecret = req.headers['x-cron-secret'];

  if (cronSecret !== process.env.CRON_SECRET) {
    res.status(401).json({ success: false, error: 'Unauthorized' });
    return;
  }

  const job = req.query.job as string;

  try {
    switch (job) {
      case 'followup':
        await runFollowupJob();
        break;
      case 'drift':
        await runDriftJob();
        break;
      case 'nudge':
        await runNudgeJob();
        break;
      default:
        res.status(400).json({ success: false, error: 'Unknown job' });
        return;
    }

    const completedAt = new Date().toISOString();
    logger.info({ job, completedAt }, 'Job completed');
    res.status(200).json({ success: true, job, completed_at: completedAt });
  } catch (err) {
    const error = err instanceof Error ? err.message : 'Unknown error';
    logger.error({ err, job }, 'Job failed');
    res.status(500).json({ success: false, error });
  }
}

export { jobRunner };
