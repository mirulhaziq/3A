import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { jobRunner } from '../jobs/runner';
import { supabase } from '../lib/supabase';

const router = Router();

router.post('/dispatch', jobRunner);

router.post(
  '/schedule',
  authMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { nudge_time } = req.body as { nudge_time: string };

      const { error } = await supabase
        .from('profiles')
        .update({ nudge_time })
        .eq('id', req.user.id);

      if (error) {
        res.status(500).json({ success: false, error: error.message });
        return;
      }

      res.json({ success: true, nudge_time });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update schedule';
      res.status(500).json({ success: false, error: message });
    }
  }
);

export { router as nudgeRouter };
